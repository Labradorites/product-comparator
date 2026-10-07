import { test } from "node:test";
import assert from "node:assert/strict";
import { runLoop } from "../src/loop.js";
import { validateHistory } from "../src/history.js";

const env = { OPENCODE_API_KEY: "test", TAVILY_API_KEY: "test" };

const PAGES = {
  "https://www.lazada.sg/crucial-p3-plus": "Crucial P3 Plus 1TB M.2 NVMe SSD, S$99.00 on Lazada",
  "https://shopee.sg/wd-sn850x": "WD Black SN850X 1TB NVMe M.2 2280 SSD for S$135",
  "https://www.amazon.sg/samsung-990": "Samsung 990 PRO 1TB NVMe M.2, S$149",
  "https://www.lazada.sg/samsung-870": "Samsung 870 EVO 1TB 2.5 inch SATA SSD S$122",
};

/**
 * Fake the network: Tavily returns PAGES, and the model returns the next
 * scripted message each call (main loop, then extraction, then main loop).
 */
async function withFakes(script, fn) {
  const realFetch = globalThis.fetch;
  const calls = { model: [], search: [] };
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).includes("tavily.com")) {
      calls.search.push(body.query);
      return Response.json({
        results: Object.entries(PAGES).map(([u, content]) => ({ url: u, title: "", content })),
      });
    }
    assert.ok(String(url).endsWith("/chat/completions"));
    calls.model.push(body);
    return Response.json({ choices: [{ message: script[calls.model.length - 1] }] });
  };
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = realFetch;
  }
}

const toolCall = (args) => ({
  role: "assistant",
  content: null,
  tool_calls: [{ id: "c1", type: "function", function: { name: "search_ssds", arguments: JSON.stringify(args) } }],
});

const candidate = (name, price, url, over = {}) => ({
  name, brand: name.split(" ")[0], type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe",
  capacity_gb: 1000, price_sgd: price, url, ...over,
});

const extraction = (candidates) => ({ role: "assistant", content: JSON.stringify({ candidates }) });

const M2_ARGS = { type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, budget_sgd: 120 };

test("slice: text → web search → extraction → code filter → results from code", async () => {
  const script = [
    toolCall(M2_ARGS),
    extraction([
      candidate("Crucial P3 Plus 1TB", 99, "https://www.lazada.sg/crucial-p3-plus"),
      candidate("WD Black SN850X 1TB", 135, "https://shopee.sg/wd-sn850x"),
    ]),
    { role: "assistant", content: "One option fits your budget." },
  ];
  await withFakes(script, async (calls) => {
    const out = await runLoop([], "1TB M.2 NVMe internal under $120", env);

    assert.equal(out.reply, "One option fits your budget.");
    assert.ok(calls.search.length >= 2, "searched the web");
    assert.deepEqual(out.results.matches.map((p) => p.name), ["Crucial P3 Plus 1TB"]);
    assert.deepEqual(out.results.near_misses.map((p) => p.name), ["WD Black SN850X 1TB"]);
    assert.equal(out.results.near_misses[0].over_budget_by, 15);
    // Story 4: source comes from the URL host, and every offer links to its page.
    assert.equal(out.results.matches[0].best_offer.source, "Lazada");
    assert.equal(out.results.matches[0].best_offer.url, "https://www.lazada.sg/crucial-p3-plus");
    assert.equal(out.results.research.candidates_kept, 2);
  });
});

test("a hallucinated or mislabelled candidate never reaches the results", async () => {
  const script = [
    toolCall(M2_ARGS),
    extraction([
      candidate("Crucial P3 Plus 1TB", 99, "https://www.lazada.sg/crucial-p3-plus"),
      candidate("Fake Drive 1TB", 50, "https://invented.example/fake"), // url not searched
      candidate("Samsung 990 PRO 1TB", 80, "https://www.amazon.sg/samsung-990"), // price not on page
      // A SATA drive mislabelled as M.2 NVMe: the page never says NVMe or M.2.
      candidate("Samsung 870 EVO 1TB", 122, "https://www.lazada.sg/samsung-870"),
    ]),
    { role: "assistant", content: "ok" },
  ];
  await withFakes(script, async () => {
    const out = await runLoop([], "1TB M.2 NVMe internal under $120", env);
    const names = [...out.results.matches, ...out.results.near_misses, ...out.results.spec_misses].map((p) => p.name);
    assert.deepEqual(names, ["Crucial P3 Plus 1TB"]);
    assert.equal(out.results.research.dropped.length, 3);
  });
});

test("the model sees code's filtered results, not the raw candidates", async () => {
  const script = [
    toolCall({ ...M2_ARGS, budget_sgd: 50 }),
    extraction([candidate("Crucial P3 Plus 1TB", 99, "https://www.lazada.sg/crucial-p3-plus")]),
    { role: "assistant", content: "nothing within budget" },
  ];
  await withFakes(script, async (calls) => {
    await runLoop([], "1TB M.2 under 50", env);
    const toolMsg = calls.model[2].messages.find((m) => m.role === "tool");
    const sent = JSON.parse(toolMsg.content);
    assert.equal(sent.matches.length, 0);
    assert.equal(sent.near_misses[0].over_budget_by, 49);
  });
});

test("search failure becomes a tool error for the model and no results", async () => {
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("tavily.com")) return new Response("boom", { status: 500 });
    seen.push(JSON.parse(init.body));
    return Response.json({
      choices: [{ message: seen.length === 1 ? toolCall(M2_ARGS) : { role: "assistant", content: "Search is down." } }],
    });
  };
  try {
    const out = await runLoop([], "1TB M.2", env);
    assert.equal(out.results, null);
    assert.equal(out.reply, "Search is down.");
    const toolMsg = seen[1].messages.find((m) => m.role === "tool");
    assert.match(JSON.parse(toolMsg.content).error, /unavailable/i);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("an invalid tool call returns an error to the model and does not search", async () => {
  const script = [
    toolCall({ type: "internal_m2", form_factor: "2.5in", interface: "SATA", capacity_gb: -1 }),
    { role: "assistant", content: "Sorry, what capacity?" },
  ];
  await withFakes(script, async (calls) => {
    const out = await runLoop([], "an ssd", env);
    assert.equal(out.results, null);
    assert.equal(calls.search.length, 0);
    const toolMsg = calls.model[1].messages.find((m) => m.role === "tool");
    assert.ok(JSON.parse(toolMsg.content).error);
  });
});

test("a reply with no tool call (clarifying question) returns null results", async () => {
  await withFakes([{ role: "assistant", content: "What capacity do you need?" }], async (calls) => {
    const out = await runLoop([], "I need an SSD", env);
    assert.equal(out.reply, "What capacity do you need?");
    assert.equal(out.results, null);
    assert.equal(calls.search.length, 0);
  });
});

test("returned messages are only user/assistant text", async () => {
  const script = [toolCall(M2_ARGS), extraction([]), { role: "assistant", content: "none found" }];
  await withFakes(script, async () => {
    const out = await runLoop([], "1TB M.2", env);
    assert.deepEqual(out.messages.map((m) => m.role), ["user", "assistant"]);
  });
});

test("validateHistory rejects system and tool messages from the client", () => {
  assert.ok(validateHistory([{ role: "system", content: "x" }]).error);
  assert.ok(validateHistory([{ role: "tool", content: "x" }]).error);
  assert.ok(validateHistory("nope").error);
  assert.deepEqual(validateHistory([{ role: "user", content: "hi", extra: 1 }]).history, [{ role: "user", content: "hi" }]);
});

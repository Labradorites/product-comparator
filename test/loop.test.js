import { test } from "node:test";
import assert from "node:assert/strict";
import { runLoop } from "../src/loop.js";
import { validateHistory } from "../src/history.js";

const env = { OPENCODE_API_KEY: "test" };

/** Fake the model: each call returns the next scripted message. */
async function withFakeModel(script, fn) {
  const realFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    assert.ok(String(url).endsWith("/chat/completions"));
    requests.push(JSON.parse(init.body));
    return Response.json({ choices: [{ message: script[requests.length - 1] }] });
  };
  try {
    return await fn(requests);
  } finally {
    globalThis.fetch = realFetch;
  }
}

const toolCall = (args) => ({
  role: "assistant",
  content: null,
  tool_calls: [{ id: "c1", type: "function", function: { name: "search_ssds", arguments: JSON.stringify(args) } }],
});

test("slice: text → search_ssds → results come from code, reply from the model", async () => {
  const script = [
    toolCall({ type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, budget_sgd: 120 }),
    { role: "assistant", content: "Two options fit within budget." },
  ];
  await withFakeModel(script, async (requests) => {
    const out = await runLoop([], "1TB M.2 NVMe internal under $120", env);

    assert.equal(out.reply, "Two options fit within budget.");
    assert.equal(requests.length, 2);
    // Story 1 + 4: only compatible drives, each with source and Trustpilot.
    const all = [...out.results.matches, ...out.results.near_misses, ...out.results.spec_misses];
    assert.ok(all.length > 0);
    for (const p of all) {
      assert.equal(p.type, "internal_m2");
      assert.equal(p.form_factor, "M.2 2280");
      assert.equal(p.interface, "NVMe");
      assert.ok(p.best_offer.source);
      assert.equal(typeof p.best_offer.trustpilot, "number");
    }
    // Story 2: budget split with scores.
    assert.ok(out.results.matches.every((p) => p.price_sgd <= 120 && typeof p.match_score === "number"));
    assert.ok(out.results.near_misses.every((p) => p.over_budget_by > 0));
  });
});

test("the model's tool result message is what code returned", async () => {
  const script = [
    toolCall({ type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 1000 }),
    { role: "assistant", content: "ok" },
  ];
  await withFakeModel(script, async (requests) => {
    await runLoop([], "1TB external", env);
    const toolMsg = requests[1].messages.find((m) => m.role === "tool");
    const sent = JSON.parse(toolMsg.content);
    assert.ok(sent.matches.every((p) => p.type === "external"));
  });
});

test("an invalid tool call returns an error to the model and no results", async () => {
  const script = [
    toolCall({ type: "internal_m2", form_factor: "2.5in", interface: "SATA", capacity_gb: -1 }),
    { role: "assistant", content: "Sorry, what capacity?" },
  ];
  await withFakeModel(script, async (requests) => {
    const out = await runLoop([], "an ssd", env);
    assert.equal(out.results, null);
    const toolMsg = requests[1].messages.find((m) => m.role === "tool");
    assert.ok(JSON.parse(toolMsg.content).error);
  });
});

test("a reply with no tool call (clarifying question) returns null results", async () => {
  await withFakeModel([{ role: "assistant", content: "What capacity do you need?" }], async () => {
    const out = await runLoop([], "I need an SSD", env);
    assert.equal(out.reply, "What capacity do you need?");
    assert.equal(out.results, null);
  });
});

test("returned messages are only user/assistant text", async () => {
  const script = [
    toolCall({ type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 1000 }),
    { role: "assistant", content: "done" },
  ];
  await withFakeModel(script, async () => {
    const out = await runLoop([], "1TB external", env);
    assert.deepEqual(out.messages.map((m) => m.role), ["user", "assistant"]);
  });
});

test("validateHistory rejects system and tool messages from the client", () => {
  assert.ok(validateHistory([{ role: "system", content: "x" }]).error);
  assert.ok(validateHistory([{ role: "tool", content: "x" }]).error);
  assert.ok(validateHistory("nope").error);
  assert.deepEqual(validateHistory([{ role: "user", content: "hi", extra: 1 }]).history, [{ role: "user", content: "hi" }]);
});

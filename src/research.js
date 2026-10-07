import { TYPES, FORM_FACTORS, INTERFACES } from "./specs.js";
import { callModel } from "./llm.js";

const TAVILY_URL = "https://api.tavily.com/search";
const SEARCH_TIMEOUT_MS = 15_000;
const RESULTS_PER_QUERY = 6;
const MAX_RESULTS = 12;
const MAX_CONTENT_CHARS = 1200;

const KIND_LABEL = {
  internal_m2: "M.2 NVMe SSD",
  internal_sata: "2.5 inch SATA SSD",
  external: "portable external SSD",
};

// What a page must mention to support the claimed type.
const TYPE_EVIDENCE = {
  internal_m2: /nvme|m\.2/i,
  internal_sata: /sata/i,
  external: /portable|external|usb/i,
};

// ---------- pure: queries, parsing, grounding ----------

export function buildQueries(filters) {
  const cap = filters.capacity_gb >= 1000 ? `${filters.capacity_gb / 1000}TB` : `${filters.capacity_gb}GB`;
  const kind = KIND_LABEL[filters.type];
  const budget = typeof filters.budget_sgd === "number" ? ` under S$${filters.budget_sgd}` : "";
  return [
    `best ${cap} ${kind} price Singapore${budget}`,
    `buy ${cap} ${kind} Singapore online store price`,
    `${cap} ${kind} price comparison Singapore retailers`,
  ];
}

/** Pull candidates out of the model's text. Tolerates code fences; never throws. */
export function parseCandidates(text) {
  if (typeof text !== "string") return [];
  const body = text.replace(/```(?:json)?/gi, "");
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(body.slice(start, end + 1));
    return Array.isArray(parsed?.candidates) ? parsed.candidates : [];
  } catch {
    return [];
  }
}

/** True if the text shows this exact amount next to a currency marker. */
export function priceAppearsIn(content, price) {
  const re = /(?:S\$|SGD|\$)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  for (const m of String(content).matchAll(re)) {
    if (parseFloat(m[1].replace(/,/g, "")) === price) return true;
  }
  return false;
}

function capacityMentioned(content, gb) {
  const tb = String(gb / 1000).replace(".", "\\.");
  return new RegExp(`(?<![\\d.])(?:${tb}\\s*TB|${gb}\\s*GB)`, "i").test(content);
}

/**
 * The model proposes; this checks. A candidate survives only if its URL was in
 * the search results and that page's text shows its price, capacity and type.
 */
export function groundCandidates(candidates, results) {
  const byUrl = new Map(results.map((r) => [r.url, r]));
  const valid = [];
  const dropped = [];

  for (const c of candidates) {
    const name = typeof c?.name === "string" ? c.name : "(unnamed)";
    const reason = rejectReason(c, byUrl);
    if (reason) dropped.push({ name, reason });
    else valid.push(c);
  }
  return { valid, dropped };
}

function rejectReason(c, byUrl) {
  if (!c || typeof c !== "object") return "not an object";
  if (typeof c.name !== "string" || !c.name.trim()) return "missing name";
  if (!TYPES.includes(c.type) || !FORM_FACTORS.includes(c.form_factor) || !INTERFACES.includes(c.interface)) {
    return "invalid type, form factor or interface";
  }
  if (typeof c.capacity_gb !== "number" || !(c.capacity_gb > 0)) return "invalid capacity";
  if (typeof c.price_sgd !== "number" || !(c.price_sgd > 0)) return "invalid price";

  const page = byUrl.get(c.url);
  if (!page) return "url was not in the search results";
  const text = `${page.title} ${page.content}`;
  if (!priceAppearsIn(text, c.price_sgd)) return "price not found on the page";
  if (!capacityMentioned(text, c.capacity_gb)) return "capacity not found on the page";
  if (!TYPE_EVIDENCE[c.type].test(text)) return `page does not support type ${c.type}`;
  return null;
}

/** Retailer name comes from the hostname, never from the model. */
export function sourceFromUrl(url) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
  if (host.includes("amazon.")) return "Amazon";
  if (host.includes("shopee.")) return "Shopee";
  if (host.includes("lazada.")) return "Lazada";
  return host;
}

/** Merge grounded candidates into products, one per model, with an offer per URL. */
export function toProducts(candidates, retrievedAt) {
  const products = new Map();
  for (const c of candidates) {
    const id = `${c.brand ?? ""}|${c.name}|${c.capacity_gb}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
    const offer = {
      source: sourceFromUrl(c.url),
      price_sgd: c.price_sgd,
      url: c.url,
      retrieved_at: retrievedAt,
      trustpilot: null,
    };
    const existing = products.get(id);
    if (existing) {
      if (!existing.offers.some((o) => o.url === offer.url)) existing.offers.push(offer);
    } else {
      products.set(id, {
        id,
        name: c.name.trim().replace(/\s+/g, " "),
        brand: c.brand ?? null,
        type: c.type,
        form_factor: c.form_factor,
        interface: c.interface,
        capacity_gb: c.capacity_gb,
        offers: [offer],
      });
    }
  }
  return [...products.values()];
}

// ---------- IO: web search and extraction ----------

export async function webSearch(query, env) {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.TAVILY_API_KEY}` },
    body: JSON.stringify({
      query,
      max_results: RESULTS_PER_QUERY,
      search_depth: "basic",
      include_answer: false,
      country: "singapore",
    }),
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Tavily returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.results ?? []).map((r) => ({
    url: r.url,
    title: r.title ?? "",
    content: String(r.content ?? "").slice(0, MAX_CONTENT_CHARS),
  }));
}

function extractionMessages(filters, results) {
  const pages = results
    .map((r, i) => `[${i + 1}] ${r.url}\n${r.title}\n${r.content}`)
    .join("\n\n");
  return [
    {
      role: "system",
      content: `You extract SSD offers from web search results. Output only JSON: {"candidates":[{"name","brand","type","form_factor","interface","capacity_gb","price_sgd","url"}]}.
Rules:
- Use only what the result text says. Never use your own memory for prices or specs.
- price_sgd must be a number that appears in that result's text as a Singapore dollar price. If the text shows no price, leave the product out.
- url must be copied exactly from the result the offer came from.
- type is one of ${TYPES.join(", ")}; form_factor one of ${FORM_FACTORS.join(", ")}; interface one of ${INTERFACES.join(", ")}.
- capacity_gb is a number (1TB is 1000).
- Prefer well-known, current models from reputable brands. Skip unbranded or unclear listings.
- Only list products that match the wanted type, form factor and interface. Capacity may be the requested size or larger.`,
    },
    {
      role: "user",
      content: `Wanted: ${JSON.stringify(filters)}\n\nSearch results:\n\n${pages}`,
    },
  ];
}

/**
 * Search the web for current offers that fit the filters. Returns
 * { products, research } where products are grounded in the fetched pages.
 */
export async function researchSsds(filters, env, now = new Date()) {
  const queries = buildQueries(filters);
  const settled = await Promise.allSettled(queries.map((q) => webSearch(q, env)));
  const failures = settled.filter((s) => s.status === "rejected");
  if (failures.length === settled.length) throw failures[0].reason;

  const seen = new Set();
  const results = settled
    .filter((s) => s.status === "fulfilled")
    .flatMap((s) => s.value)
    .filter((r) => r.url && !seen.has(r.url) && seen.add(r.url))
    .slice(0, MAX_RESULTS);

  const reply = await callModel(extractionMessages(filters, results), env, crypto.randomUUID());
  const proposed = parseCandidates(reply.content);
  const { valid, dropped } = groundCandidates(proposed, results);

  return {
    products: toProducts(valid, now.toISOString()),
    research: {
      queries,
      pages_read: results.length,
      candidates_proposed: proposed.length,
      candidates_kept: valid.length,
      dropped,
    },
  };
}

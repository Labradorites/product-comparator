import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildQueries,
  parseCandidates,
  priceAppearsIn,
  groundCandidates,
  toProducts,
  sourceFromUrl,
} from "../src/research.js";

const filters = { type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, budget_sgd: 120 };

const results = [
  { url: "https://www.lazada.sg/p1", title: "Crucial P3 Plus", content: "Crucial P3 Plus 1TB M.2 NVMe SSD now S$99.00 on Lazada" },
  { url: "https://shopee.sg/p2", title: "WD", content: "WD Black SN850X 2TB NVMe M.2, price $210" },
];

const cand = (over = {}) => ({
  name: "Crucial P3 Plus 1TB", brand: "Crucial", type: "internal_m2", form_factor: "M.2 2280",
  interface: "NVMe", capacity_gb: 1000, price_sgd: 99, url: "https://www.lazada.sg/p1", ...over,
});

test("buildQueries mentions capacity, kind, Singapore and the budget", () => {
  const qs = buildQueries(filters);
  assert.ok(qs.length >= 2);
  assert.ok(qs.every((q) => /Singapore|\.sg/i.test(q)));
  assert.ok(qs[0].includes("1TB") && qs[0].includes("NVMe"));
  assert.ok(qs.some((q) => q.includes("120")));
  // Not tied to any one marketplace, so other retailers can surface.
  assert.ok(qs.every((q) => !/shopee|lazada|amazon/i.test(q)));
});

test("parseCandidates handles plain JSON, code fences and garbage", () => {
  const json = JSON.stringify({ candidates: [cand()] });
  assert.equal(parseCandidates(json).length, 1);
  assert.equal(parseCandidates("```json\n" + json + "\n```").length, 1);
  assert.deepEqual(parseCandidates("sorry, no idea"), []);
  assert.deepEqual(parseCandidates(null), []);
});

test("priceAppearsIn needs a currency marker and an exact amount", () => {
  assert.ok(priceAppearsIn("now S$99.00 only", 99));
  assert.ok(priceAppearsIn("SGD 1,299", 1299));
  assert.ok(priceAppearsIn("price $210", 210));
  assert.ok(!priceAppearsIn("only 99 left in stock", 99));
  assert.ok(!priceAppearsIn("S$199", 99));
});

test("a grounded candidate passes", () => {
  const { valid, dropped } = groundCandidates([cand()], results);
  assert.equal(valid.length, 1);
  assert.equal(dropped.length, 0);
});

test("drops a candidate whose URL was not in the search results", () => {
  const { valid, dropped } = groundCandidates([cand({ url: "https://made.up/x" })], results);
  assert.equal(valid.length, 0);
  assert.match(dropped[0].reason, /url/i);
});

test("drops a candidate whose price is not on its page", () => {
  const { valid, dropped } = groundCandidates([cand({ price_sgd: 59 })], results);
  assert.equal(valid.length, 0);
  assert.match(dropped[0].reason, /price/i);
});

test("drops a candidate whose capacity is not on its page", () => {
  const { dropped } = groundCandidates([cand({ capacity_gb: 2000 })], results);
  assert.match(dropped[0].reason, /capacity/i);
});

test("drops a candidate whose page does not support the claimed form factor", () => {
  const sata = [{ url: "https://www.lazada.sg/p3", title: "x", content: "Samsung 870 EVO 1TB 2.5 SATA S$120" }];
  const { dropped } = groundCandidates([cand({ url: "https://www.lazada.sg/p3", price_sgd: 120 })], sata);
  assert.match(dropped[0].reason, /type|spec/i);
});

test("drops candidates with invalid enums or non-numeric price", () => {
  assert.equal(groundCandidates([cand({ type: "flash" })], results).valid.length, 0);
  assert.equal(groundCandidates([cand({ price_sgd: "99" })], results).valid.length, 0);
  assert.equal(groundCandidates([null, "x"], results).valid.length, 0);
});

test("sourceFromUrl names the retailer from the hostname, not from the model", () => {
  assert.equal(sourceFromUrl("https://www.amazon.sg/dp/x"), "Amazon");
  assert.equal(sourceFromUrl("https://shopee.sg/p"), "Shopee");
  assert.equal(sourceFromUrl("https://www.lazada.sg/p"), "Lazada");
  assert.equal(sourceFromUrl("https://www.price.com.sg/x"), "price.com.sg");
});

test("toProducts merges the same model across URLs into one product with several offers", () => {
  const a = cand();
  const b = cand({ url: "https://shopee.sg/p9", price_sgd: 95, name: "Crucial  P3 Plus 1TB" });
  const products = toProducts([a, b], "2026-10-07T00:00:00Z");
  assert.equal(products.length, 1);
  assert.equal(products[0].offers.length, 2);
  assert.deepEqual(products[0].offers.map((o) => o.source).sort(), ["Lazada", "Shopee"]);
  assert.equal(products[0].offers[0].trustpilot, null);
  assert.equal(products[0].offers[0].retrieved_at, "2026-10-07T00:00:00Z");
});

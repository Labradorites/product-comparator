import { test } from "node:test";
import assert from "node:assert/strict";
import { filterAndRank } from "../src/search.js";

const offer = (price_sgd, source = "Amazon") => ({
  source,
  price_sgd,
  url: "https://example.com",
  trustpilot: 4.1,
  checked_at: "2026-10-07",
});

const catalogue = [
  { id: "a", name: "A 1TB NVMe", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, offers: [offer(100), offer(90, "Shopee")] },
  { id: "b", name: "B 2TB NVMe", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 2000, offers: [offer(200)] },
  { id: "c", name: "C 1TB SATA", type: "internal_sata", form_factor: "2.5in", interface: "SATA", capacity_gb: 1000, offers: [offer(80)] },
  { id: "d", name: "D 1TB external", type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 1000, offers: [offer(110)] },
];

const want = { type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000 };

test("never returns a product with a different type, form factor or interface", () => {
  const { matches, near_misses } = filterAndRank(catalogue, want);
  const ids = [...matches, ...near_misses].map((r) => r.id);
  assert.deepEqual(ids.sort(), ["a", "b"]);
});

test("capacity must be at least the requested size", () => {
  const { matches, near_misses } = filterAndRank(catalogue, { ...want, capacity_gb: 2000 });
  const ids = [...matches, ...near_misses].map((r) => r.id);
  assert.deepEqual(ids, ["b"]);
});

test("without a budget everything compatible is a match", () => {
  const { matches, near_misses } = filterAndRank(catalogue, want);
  assert.equal(matches.length, 2);
  assert.equal(near_misses.length, 0);
});

test("uses the cheapest offer as the product price and keeps all offers as sources", () => {
  const { matches } = filterAndRank(catalogue, { ...want, budget_sgd: 150 });
  const a = matches.find((r) => r.id === "a");
  assert.equal(a.price_sgd, 90);
  assert.equal(a.offers.length, 2);
  assert.equal(a.best_offer.source, "Shopee");
});

test("splits within-budget matches from over-budget near misses", () => {
  const { matches, near_misses } = filterAndRank(catalogue, { ...want, budget_sgd: 150 });
  assert.deepEqual(matches.map((r) => r.id), ["a"]);
  assert.deepEqual(near_misses.map((r) => r.id), ["b"]);
  assert.equal(near_misses[0].over_budget_by, 50);
});

test("nothing within budget returns near misses with the gap", () => {
  const { matches, near_misses } = filterAndRank(catalogue, { ...want, budget_sgd: 50 });
  assert.equal(matches.length, 0);
  assert.equal(near_misses.length, 2);
  assert.ok(near_misses.every((r) => r.over_budget_by > 0));
});

test("when no compatible product exists, reports the closest spec misses", () => {
  const res = filterAndRank(catalogue, { type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 4000, budget_sgd: 50 });
  assert.equal(res.matches.length, 0);
  assert.equal(res.near_misses.length, 0);
  assert.deepEqual(res.spec_misses.map((r) => r.id), ["d"]);
  assert.match(res.spec_misses[0].misses.join(" "), /capacity/);
});

test("match score is 0-100 and higher for a price closer to the budget", () => {
  const { matches } = filterAndRank(catalogue, { ...want, budget_sgd: 100 });
  for (const r of matches) assert.ok(r.match_score >= 0 && r.match_score <= 100);
  const close = filterAndRank(catalogue, { ...want, budget_sgd: 95 }).matches[0];
  const far = filterAndRank(catalogue, { ...want, budget_sgd: 300 }).matches.find((r) => r.id === "a");
  assert.ok(close.match_score > far.match_score);
});

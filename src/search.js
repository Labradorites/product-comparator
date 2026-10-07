/**
 * Pure product search. This is the compatibility guardrail: type, form factor
 * and interface must equal what the user chose. The LLM never decides this.
 */

/**
 * filters: { type, form_factor, interface, capacity_gb, budget_sgd? }
 *
 * Returns:
 *  - matches: compatible, capacity >= requested, within budget (or no budget given)
 *  - near_misses: compatible, capacity >= requested, over budget (with over_budget_by)
 *  - spec_misses: compatible form factor/interface/type but smaller than requested,
 *    with `misses` saying which spec fails
 */
export function filterAndRank(catalogue, filters) {
  const { type, form_factor, interface: iface, capacity_gb, budget_sgd } = filters;
  const hasBudget = typeof budget_sgd === "number";

  const compatible = catalogue.filter(
    (p) => p.type === type && p.form_factor === form_factor && p.interface === iface,
  );

  const matches = [];
  const near_misses = [];
  const spec_misses = [];

  for (const product of compatible) {
    const priced = withBestOffer(product);
    if (!priced) continue;

    if (product.capacity_gb < capacity_gb) {
      spec_misses.push({
        ...priced,
        misses: [`capacity ${product.capacity_gb}GB is below the requested ${capacity_gb}GB`],
        ...(hasBudget && priced.price_sgd > budget_sgd
          ? { over_budget_by: round2(priced.price_sgd - budget_sgd) }
          : {}),
      });
      continue;
    }

    const match_score = matchScore(priced, filters);
    if (hasBudget && priced.price_sgd > budget_sgd) {
      near_misses.push({
        ...priced,
        match_score,
        over_budget_by: round2(priced.price_sgd - budget_sgd),
      });
    } else {
      matches.push({ ...priced, match_score });
    }
  }

  matches.sort((a, b) => b.match_score - a.match_score);
  near_misses.sort((a, b) => a.over_budget_by - b.over_budget_by);
  spec_misses.sort((a, b) => b.capacity_gb - a.capacity_gb);

  return { matches, near_misses, spec_misses };
}

/** The product's price is its cheapest offer; every offer stays as a source. */
function withBestOffer(product) {
  const offers = product.offers ?? [];
  if (offers.length === 0) return null;
  const best_offer = offers.reduce((a, b) => (b.price_sgd < a.price_sgd ? b : a));
  return { ...product, price_sgd: best_offer.price_sgd, best_offer };
}

/**
 * 0-100. Half price closeness to budget, half spec match. The brief leaves the
 * formula open, so keep it here in one place.
 */
function matchScore(product, { capacity_gb, budget_sgd }) {
  const specScore =
    product.capacity_gb === capacity_gb
      ? 100
      : Math.max(50, (100 * capacity_gb) / product.capacity_gb);
  const priceScore =
    typeof budget_sgd === "number"
      ? Math.max(0, 100 * (1 - Math.abs(product.price_sgd - budget_sgd) / budget_sgd))
      : 100;
  return Math.round(0.5 * priceScore + 0.5 * specScore);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

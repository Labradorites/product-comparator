# SSD picker: product brief

**In one line:** Helps someone upgrading a laptop choose an SSD that fits their specifications and budget, and know when to buy.

## Problem

When upgrading a laptop and looking for an SSD, they compare specifications across many models and prices across different sites, which leaves them overloaded and tired of deciding. Reviews they find contradict each other, and having not seen the site or reviewer before, they cannot tell what is legitimate. If nothing changes, they will not end up with an SSD they can use, and they may miss the best prices.

## Evidence

- They were recently buying an SSD themselves, comparing models, asking peers and reading articles on specs and prices.
- Reviews across platforms conflict, so they are unsure who to trust.
- Not checked yet: whether other laptop upgraders feel overloaded enough to want help deciding.

## Success

- **Metric:** time spent comparing SSD specifications and prices.
- **Today:** about 1 week.
- **Target:** about 1 week saved.
- **Must not get worse:** not set.

## Riskiest bet

People upgrading a laptop feel overloaded enough by comparing SSD specs and prices that they want help deciding.

- **Test:** in 30 minutes, without code, suggest one product to buy and check it exists on the supplier's site.
- **Pass mark:** a real product comes out at a price comparable to or better than the market price.
- **Result:** not run yet

## First version

1. As someone upgrading my laptop, I type in 3 or 4 specifications for the SSD I want. Done when I see a short list that matches.
2. As that person, I give a budget. Done when I see which matching products sit inside it and which do not.
3. As that person, I see how the price has moved over time. Done when I can tell whether waiting for a sale is worth it.

## Walkthrough

1. They open the chat and are asked what they want to buy today.
2. They key in the SSD specifications and see products that could fit.
3. They give a budget and see products that fit both budget and specifications.
4. A price trend suggests waiting, so they are prompted about an upcoming sale.
   If it goes wrong: with nothing inside budget, they are asked whether budget or specifications matters more, then shown alternatives that fit one but not both, or the closest option to both.

## Not building

- Anything beyond SSD selection for one person upgrading a laptop.
- A checkout or buying flow.
- Our own reviews or trust scores for reviewers, though trust is named in the problem.

## Open questions

- What must not get worse is not set.
- The test checks a product and price can be found, not that people want help deciding.
- What the user sees when nothing matches is undecided.

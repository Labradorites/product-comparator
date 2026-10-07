# SSD picker: product brief

**In one line:** Helps someone in Singapore choose an internal or external SSD for their laptop that fits their specifications and budget, and know when to buy.

## Problem

When upgrading a laptop and looking for an SSD, they compare specifications across many models and prices across different sites, which leaves them overloaded and tired of deciding. Reviews they find contradict each other, and having not seen the site or reviewer before, they cannot tell what is legitimate. If nothing changes, they will not end up with an SSD they can use, and they may miss the best prices.

## Evidence

- They were recently buying an SSD themselves, comparing models, asking peers and reading articles on specs and prices.
- Reviews across platforms conflict, so they are unsure who to trust.
- Not checked yet: whether other people buying SSDs or similar spec-heavy parts feel overloaded enough to want help deciding.

## Success

- **Metric:** time from first specification to a confident pick.
- **Today:** about 1 week.
- **Target:** under 1 hour.
- **Must not get worse:** compatibility. The recommended SSD must work with the user's laptop (form factor and interface match what they chose). Any mismatch a user reports counts as a failure.
- **How measured:** test users time themselves from first spec to "I'd buy this", then rate their confidence from 1 to 5.

## Riskiest bet

People buying an SSD for their laptop feel overloaded enough by comparing specs and prices that they want help deciding.

- **Test:** in 30 minutes, without code, give each participant a hand-picked recommendation for their stated needs and ask whether they would have used it instead of their own research.
- **Participants:** people buying SSDs, or similar spec-heavy parts such as RAM, laptops or GPUs. Results from people buying other things are weaker evidence and are reported apart from the main pass rate.
- **Pass mark:** at least 80% of participants say they would have used the recommendation.
- **Also ask:** "What would make you believe this pick?" Report it as a separate row, not part of the pass mark.
- **Result:** not run yet

## First version

The user types what they want into one box. An LLM turns it into filters, picks and ranks matching products from the catalogue, and explains each pick, including how it misses when nothing matches.

1. As someone buying an SSD for my laptop, I give 3 or 4 specifications: capacity, form factor, interface, and type (internal M.2, internal SATA, or external). Done when I see a short list that matches.
2. As that person, I give a budget. Done when I see which matching products sit inside it and which do not. Each option shows a match score based on how close its price is to my budget and how well its specifications match mine.
3. As that person, I see how the price has moved over time. Done when I can tell whether waiting for a sale is worth it.
4. As that person, I see the source of every price and the Trustpilot score of the site selling it. Done when I can tell where each option comes from and how far to trust that seller.

**Data:** about 10 popular models in Singapore, with prices from Amazon, Shopee and Lazada. Use live collection or official APIs where possible. Price history is recorded from the first day.

## Walkthrough

1. They open the app and are asked what they want to buy today.
2. They describe the SSD they want and see products that could fit.
3. They give a budget and see products that fit both budget and specifications, each with a match score.
4. A price trend suggests waiting, so they are prompted about an upcoming sale.
   If it goes wrong: with nothing inside budget, both sets appear at once: "fits specs, over budget by X" and "within budget, misses spec Y".

## Not building

- Anything beyond SSD selection for one person buying an internal or external SSD for a laptop.
- A checkout or buying flow.
- Our own reviews or trust scores. Third-party scores (Trustpilot) are shown instead.
- A laptop-model lookup. The user picks the specifications.

## Open questions

- The brief says the user states specifications in one box and the LLM also makes the recommendation (all of Q11 a, b, c). It is undecided how strictly code, not the LLM, should filter on compatibility so the guardrail holds.
- Price history needs time to build. It is undecided what story 3 shows until there are enough data points.
- Amazon, Shopee and Lazada may block or forbid live collection. If so, it is undecided whether to fall back to manual snapshots.
- The match score formula (price closeness versus specification match) is not defined.
- How Trustpilot scores are obtained and refreshed is undecided.
- The 80% pass mark has no minimum number of participants yet.

# SSD picker: grill questions

Write your answer under each **Your answer** line. Q1 is settled: the first test checks demand.

---

## Q2 - What must not get worse?

The success metric is time spent comparing, from about 1 week to about 1 week saved. That target says the whole week should disappear, which is a very high bar. The "must not get worse" guardrail is blank. Candidates:

- (a) The recommended SSD is compatible with their laptop.
- (b) The price paid isn't higher than what they'd have found themselves.
- (c) Their confidence in the choice.

**Recommended:** Make (a) compatibility the guardrail. A wrong form factor or interface means the user ends up with an SSD they can't use, which is the failure the Problem section names. Also reduce the target to something realistic, for example "under 1 hour to a confident pick".

**Your answer:**
yup let (a) be the guardrail. Change the success metric to "from 1 week to under 1 hour to a confident pick"

---

## Q3 - Where does the price and spec data come from?

Stories 1 to 3 need specs, current prices across sites, and price history. Options: scrape retailers, use a price-API or affiliate feed, or hand-curate a small catalogue for v1. This decides whether story 3 (price trend) is feasible at all, because history needs data collected over time.

**Recommended:** Hand-curate roughly 20 to 30 SSDs for v1 and snapshot prices manually. Treat story 3 (trend) as a stretch goal that needs real history, or fake it clearly labelled as a prototype.

**Your answer:**
commonly used sites in singapore (e.g. amazon, shopee, lazada). Track the popular brands and models of ssds.

---

## Q4 - What are the "3 or 4 specifications"?

Story 1 doesn't say which ones. Likely candidates are capacity, form factor (M.2 2280 or 2.5" SATA), interface (NVMe or SATA), and PCIe generation. Should the user pick these, or should the tool ask for their laptop model and work them out?

**Recommended:** Let the user pick: capacity, form factor, interface, and an optional speed tier. Laptop-model lookup can wait. It adds a data dependency and isn't in the first version.

**Your answer:**
the user should pick their own capacity/ form factor/ interface. it may not be an internal SSD either.

---

## Q5 - Chat or form?

The walkthrough says "open the chat", but the stories read like structured filtering (specs, then budget, then results). A chat adds the cost of language parsing and conversation state. A form with results is simpler.

**Recommended:** Use a simple form with a results list for v1. Add the conversational wrapper only if the demand test shows people want to be guided.

**Your answer:**
if its a form will i lose the "LLM" factor? I need it to be in my application.

---

## Q6 - What happens when nothing matches?

This is already an open question in the brief. The walkthrough says to ask "budget or specs matters more", then show alternatives that fit one but not both, or the closest option to both. Should the tool ask, or show both alternative sets at once?

**Recommended:** Show both at once without asking: "Fits specs, over budget by X" and "Within budget, misses spec Y". It's one less turn and the user can see the tradeoff directly.

**Your answer:**
use the recommendation.

---

## Q7 - Who counts as a test participant?

The brief's only evidence is your own recent purchase. Who would you test with: people who recently upgraded a laptop SSD, people about to, or anyone who owns a laptop?

**Recommended:** Recent or imminent upgraders only, 5 to 10 people. Anyone else can't say whether they felt overloaded.

**Your answer:**
Anyone looking to buy a product. may not be limited to SSD.

---

## Q8 - What do you do with the participants?

Options:

- (a) Ask them about their last purchase.
- (b) Give them a hand-picked recommendation for their stated needs and see whether they'd have used it.
- (c) Build a landing page and measure sign-ups.

**Recommended:** Do (b) on top of a short (a). Past behaviour is stronger evidence than opinions, and (b) needs no code, which matches your 30-minute constraint. A landing page (c) takes longer and measures interest in the page, not in the help.

**Your answer:**
just do b

---

## Q9 - What pass mark shows demand?

Your current pass mark checks product and price. For demand you need a threshold, for example "at least 4 of 6 say the recommendation would have saved them real time and they'd have trusted it".

**Recommended:** Pass if at least 60% say they would have used the recommendation. They must also say it would have saved them at least half the time they actually spent. Fail if fewer than half say they'd have trusted a tool they hadn't seen before.

**Your answer:**
80% is a better passing rate. Show the passing rate for all the matches anyway.

---

## Q10 - Does the trust problem need testing now?

Your Problem section says people can't tell which reviews or sites are legitimate. If they don't trust the tool either, demand won't convert. Should the test also ask why they'd trust the recommendation?

**Recommended:** Yes, add one question: "What would make you believe this pick?" It costs nothing, and it shows whether you need to show sources or specs transparently in v1, since you aren't building trust scores.

**Your answer:**
Sure. You may also want to use trustpilot.com to check trust scores of the sites.

---

# Round 2

Q2 to Q10 are answered above. These questions follow from your answers.

---

## Q11 - Where does the LLM fit if the interface is a form?

A form doesn't remove the LLM. You could keep the structured filters and use the LLM for specific jobs:

- (a) Parse free text such as "1TB external for my MacBook under $150" into the filters.
- (b) Explain why each pick fits or misses.
- (c) Make the recommendation and handle the "nothing matches" tradeoff.
- (d) Run a full chat.

Which job must the LLM do for this to count as an LLM application?

**Recommended:** (a) plus (b). The user types what they want in one box, the LLM turns it into filters, and the filters, not the LLM, pick the products. The LLM then writes the explanation from the data. This keeps the LLM visible while stopping it from inventing products or prices, which matters because compatibility is your guardrail.

**Your answer:**
use it for a, b, and c

---

## Q12 - How do you collect prices from Amazon, Shopee and Lazada?

Those sites generally block or forbid scraping. Price history, which story 3 needs, only exists if you record prices over time starting now. Options:

- (a) Scrape live.
- (b) Use official affiliate or product APIs where they exist.
- (c) Manually snapshot a fixed list of models on a schedule.

And does story 3 ship in v1 with only a few days of history?

**Recommended:** (c) for v1: a fixed list of about 20 to 30 popular models, with prices recorded by hand or a simple script from day one. Show the trend only once there are enough data points, and say so on screen when there aren't.

**Your answer:**
lets just do 10 popular models. if possible use (a) and (b). sources must be included when presenting the options.

---

## Q13 - Is the product still "laptop SSD upgrade" now that external SSDs count?

You said the product may be external too. The brief's "Not building" says "Anything beyond SSD selection for one person upgrading a laptop". An external drive is arguably not a laptop upgrade, and it changes what compatibility means (ports, speed, enclosure). Do you want to widen the scope?

**Recommended:** Yes, widen it to "internal or external SSD for a laptop". Add a type field (internal M.2, internal SATA, external) as one of the user's choices. Update the "Not building" line so it doesn't contradict this.

**Your answer:**
follow the recommendation.

---

## Q14 - Who is the test group, given the riskiest bet is about SSDs?

You said anyone buying a product, not only SSDs. The bet is "laptop upgraders feel overloaded by SSD specs and prices". If a participant is shopping for headphones, their answer doesn't test that bet. It would test whether product comparison in general is a pain.

**Recommended:** Keep the group to people buying SSDs or similar spec-heavy parts such as RAM, laptops or GPUs. If you can't find enough SSD buyers, mark those results as weaker evidence. Don't mix them into the main pass rate.

**Your answer:**
follow the recommendation.

---

## Q15 - What does "show the passing rate for all the matches" mean?

I read your answer on the pass mark two ways:

- (a) Report the pass rate for each participant's recommendation individually.
- (b) Report the 80% rate overall, and also break it down by product type or participant group.
- (c) Something else.

**Recommended:** (b). Overall pass is at least 80% of participants who say they'd use it. Next to it, show the breakdown per group so you can see who it works for. Keep the trust question (Q10) as a separate row, not part of the pass.

**Your answer:**
report the pass rate of each option based on the similarity of their price to budget provided, and the product specifications matching the provided specs.

---

## Q16 - How is Trustpilot used, and does it break "no trust scores"?

The brief says you won't build your own trust scores. Showing Trustpilot's score for each retailer is a third-party score, so it isn't strictly a violation. But it means a new data source and a new thing for the user to understand. Should it be in v1 or in the demand test?

**Recommended:** Use it as a manual input in the demand test only, to answer "what would make you believe this pick?". Show the retailer's Trustpilot score beside the price. Leave automation out of v1 until the test shows trust is what people care about. Rewrite the "Not building" line to say "no scores of our own".

**Your answer:**
trustpilot score is to ensure that users are aware of the trust score of the website selling the product.

---

## Q17 - How will you measure "under 1 hour to a confident pick" and the compatibility guardrail?

Your new metric is time to a confident pick. Today's figure is "about 1 week", from your own purchase. How will you know the time and the confidence after you build it? And how do you check compatibility: the user confirms it, or you compare against a laptop model?

**Recommended:** Time: ask test users to time themselves from first spec to the point where they say "I'd buy this". Confidence: a 1 to 5 score at the end. Compatibility: shown as the user's own chosen form factor and interface matching the product's, with no laptop-model check in v1. Count any mismatch the user reports as a guardrail failure.

**Your answer:**
take the recommendation.

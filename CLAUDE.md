# SSD picker

Helps someone in Singapore choose an internal or external SSD for their laptop. See `product-brief.md` for the stories and `grill-questions.md` for decisions.

## Stack
Plain JavaScript (ESM) on a Cloudflare Worker. No runtime dependencies, no build step. The LLM is opencode.ai through its OpenAI-compatible endpoint, called with `fetch` in `src/loop.js` (same approach as the sibling repo `lunch-uncle`).

- `npm run dev` runs `wrangler dev` (needs `OPENCODE_API_KEY` in `.dev.vars`)
- `npm test` runs `node --test`

## Rules
- **Compatibility is code, never the LLM.** Type, form factor and interface must equal the user's choice. This lives in `src/search.js` and is the project's guardrail. Any mismatch is a failure.
- The UI shows products from the tool result (`results`), never from the model's text. The model only parses the request and writes the explanation.
- The client may send only user/assistant text as history. Never accept tool or system messages from it.
- Each tool is an IO part plus a pure part. Test the pure part. Fake `globalThis.fetch` for model calls (see `test/loop.test.js`).
- Secrets come from `env` only. Never commit `.dev.vars`.
- Do not add runtime dependencies or a build step.

## Data
There is no stored catalogue. Offers come from a live web search per request (`src/research.js`):
1. Tavily searches the web (platform-neutral queries, so any Singapore retailer can surface).
2. The model extracts candidate offers from the result text as JSON.
3. **Code grounds every candidate** before it is shown: its URL must be in the search results, and that page's text must show the price (with a currency marker), the capacity and evidence of the type. Anything else is dropped. The retailer name comes from the URL host, never from the model.
4. `filterAndRank` then applies compatibility and budget.

Prices are unverified web data: show the URL and retrieval time. Trustpilot scores are not built yet (`trustpilot` is `null`). Price history (story 3) is not built yet.

Secrets: `OPENCODE_API_KEY` and `TAVILY_API_KEY`.

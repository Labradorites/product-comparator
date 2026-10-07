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
`src/catalogue.js` is **sample data**: real model names, placeholder prices, Trustpilot scores and URLs, each offer flagged `sample: true`. Replace with real manual snapshots before any user test. Price history (story 3) is not built yet.

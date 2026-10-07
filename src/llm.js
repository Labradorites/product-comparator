const LLM_BASE_URL = "https://opencode.ai/zen/go/v1";
const LLM_MODEL = "glm-5.3-flash";
const LLM_TIMEOUT_MS = 30_000;

/**
 * One chat completion. Pass `tools` (OpenAI function definitions) to allow tool
 * calls; leave it out for a plain call such as the extraction step.
 */
export async function callModel(messages, env, sessionId, tools) {
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENCODE_API_KEY}`,
      "x-opencode-session": sessionId,
    },
    body: JSON.stringify({ model: LLM_MODEL, messages, ...(tools ? { tools } : {}) }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`LLM returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const message = data?.choices?.[0]?.message;
  if (!message) {
    throw new Error(`LLM returned no message: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return {
    role: "assistant",
    content: message.content ?? null,
    ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
  };
}

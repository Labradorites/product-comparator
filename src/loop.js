import { buildSystemPrompt } from "./prompt.js";
import { toolDefinitions, executeTool } from "./tools.js";

const LLM_BASE_URL = "https://opencode.ai/zen/go/v1";
const LLM_MODEL = "glm-5.3-flash";

const LLM_TIMEOUT_MS = 20_000;
const MAX_ROUNDS = 4;
const MAX_TOOL_CALLS_PER_ROUND = 2;
const TURN_DEADLINE_MS = 45_000;

const GIVE_UP_REPLY = "I could not finish that search. Try giving the type, capacity and budget again.";
const EMPTY_REPLY = "I did not catch that. What SSD are you looking for?";

/**
 * Run the agentic loop for one user turn.
 *
 * history is prior user/assistant text turns only. Tool calls and results stay
 * inside the turn, so the client can never forge a tool result.
 *
 * Returns { reply, results, messages }:
 *  - results: the last search_ssds output (from code, not the model), or null
 *  - messages: this turn's user and assistant text, for the client to keep
 */
export async function runLoop(history, message, env) {
  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];
  const sessionId = crypto.randomUUID();
  const deadline = Date.now() + TURN_DEADLINE_MS;
  let results = null;

  for (let round = 0; round < MAX_ROUNDS && Date.now() < deadline; round++) {
    const assistant = await callModel(messages, env, sessionId);
    messages.push(assistant);

    const toolCalls = assistant.tool_calls ?? [];
    if (toolCalls.length === 0) {
      const reply = assistant.content?.trim() ? assistant.content : EMPTY_REPLY;
      return finish(reply, results, message);
    }

    for (const [i, call] of toolCalls.entries()) {
      const { toolMessage, data } = runToolCall(call, i, round);
      messages.push(toolMessage);
      if (data) results = data;
    }
  }

  return finish(GIVE_UP_REPLY, results, message);
}

function finish(reply, results, message) {
  return {
    reply,
    results,
    messages: [
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ],
  };
}

/** Always returns a tool message, so the model can recover from a bad call. */
function runToolCall(call, index, round) {
  call.id ??= `call_${round}_${index}`;
  const reply = (result) => ({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });

  if (index >= MAX_TOOL_CALLS_PER_ROUND) {
    return { toolMessage: reply({ error: "Too many tool calls at once, ask for fewer." }) };
  }
  const name = call.function?.name;
  const args = parseArgs(call.function?.arguments);
  if (typeof name !== "string" || args === null) {
    return { toolMessage: reply({ error: "Invalid tool call: arguments must be a JSON object." }) };
  }

  const { result, data } = executeTool(name, args);
  return { toolMessage: reply(result), data };
}

async function callModel(messages, env, sessionId) {
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENCODE_API_KEY}`,
      "x-opencode-session": sessionId,
    },
    body: JSON.stringify({ model: LLM_MODEL, messages, tools: toolDefinitions }),
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

/** Returns a plain object, or null if the model sent something else. */
export function parseArgs(raw) {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_MESSAGES = 10;

/** The client may only send plain user/assistant text, never system or tool messages. */
export function validateHistory(history) {
  if (!Array.isArray(history)) return { error: "history must be an array" };
  if (history.length > MAX_HISTORY_MESSAGES) return { error: "history is too long" };
  for (const m of history) {
    const okRole = m?.role === "user" || m?.role === "assistant";
    if (!okRole || typeof m.content !== "string" || m.content.length > MAX_MESSAGE_CHARS * 4) {
      return { error: "history must contain only user and assistant text messages" };
    }
  }
  return { history: history.map(({ role, content }) => ({ role, content })) };
}

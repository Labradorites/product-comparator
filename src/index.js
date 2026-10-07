import ui from "./ui.html";
import { runLoop } from "./loop.js";
import { validateHistory, MAX_MESSAGE_CHARS } from "./history.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/") {
      return new Response(ui, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (request.method === "POST" && pathname === "/recommend") {
      return handleRecommend(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};

async function handleRecommend(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Body must be JSON" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Body must be a JSON object" }, 400);
  }

  const { history = [], message } = body;
  if (typeof message !== "string" || message.trim() === "") {
    return json({ error: "message is required" }, 400);
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return json({ error: `message must be at most ${MAX_MESSAGE_CHARS} characters` }, 400);
  }
  const checked = validateHistory(history);
  if (checked.error) return json({ error: checked.error }, 400);

  try {
    const { reply, results, messages } = await runLoop(checked.history, message, env);
    return json({ reply, results, messages });
  } catch (err) {
    console.error("recommend failed:", err);
    return json({ error: "Could not get a recommendation right now, try again later." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

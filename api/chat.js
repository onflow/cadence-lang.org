/**
 * POST /api/chat — Cadence docs assistant.
 *
 * Ported from the redesign's TanStack server route (src/routes/api/chat.ts).
 * Docusaurus emits a static site, so the handler runs as a Vercel Function
 * alongside it instead of inside the framework.
 *
 * Backed by Baseten's OpenAI-compatible Model API. BASETEN_API_KEY is read
 * only here, server-side, and is never bundled into or exposed to the client.
 */

const BASETEN_BASE_URL =
  process.env.BASETEN_BASE_URL ?? "https://inference.baseten.co/v1";
const MODEL = process.env.CHAT_MODEL ?? "moonshotai/Kimi-K3";

// Abuse-protection knobs, carried over from the redesign (F-007 triage).
const RATE_LIMIT_PER_MIN = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? 30);
// Kimi-K3 is a reasoning model: reasoning tokens are billed against the same
// budget and can consume it entirely, returning empty content. Headroom here
// is deliberate.
const MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS ?? 4096);
const MAX_MESSAGE_HISTORY = Number(process.env.CHAT_MAX_MESSAGES ?? 8);
const ALLOWED_ORIGIN =
  process.env.CHAT_ALLOWED_ORIGIN ?? "https://cadence-lang.org";

const SYSTEM_PROMPT = `You are an expert assistant for the Cadence programming language — \
a resource-oriented smart contract language for the Flow blockchain.

Your knowledge base is the Cadence documentation at https://cadence-lang.org. \
When answering, reference specific doc pages where relevant (e.g. "/docs/language/resources").

Guidelines:
- Be concise and technical. Developers are your audience.
- Use Cadence code examples when helpful.
- If you don't know, say so — never hallucinate API details.
- Key concepts: resources (@), capabilities, entitlements, access control, transactions, scripts.`;

// In-memory sliding-window limiter, per client IP. Single-region only, which
// is adequate for a docs assistant; a multi-region deployment should move
// this to Vercel KV / Upstash Redis.
const rateBuckets = new Map();
let lastCleanup = 0;

function clientId(req) {
  const fwd = req.headers["x-forwarded-for"];
  const first = Array.isArray(fwd) ? fwd[0] : fwd;
  return (
    (typeof first === "string" && first.split(",")[0].trim()) ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

function checkRateLimit(id) {
  const now = Date.now();
  const windowStart = now - 60_000;
  let bucket = rateBuckets.get(id);
  if (!bucket) {
    bucket = { hits: [] };
    rateBuckets.set(id, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => t >= windowStart);
  if (bucket.hits.length >= RATE_LIMIT_PER_MIN) {
    const retryAfter = Math.max(
      1,
      Math.ceil((bucket.hits[0] + 60_000 - now) / 1000),
    );
    return { ok: false, retryAfter };
  }
  bucket.hits.push(now);
  return { ok: true };
}

function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  const cutoff = now - 60_000;
  for (const [id, bucket] of rateBuckets) {
    bucket.hits = bucket.hits.filter((t) => t >= cutoff);
    if (bucket.hits.length === 0) rateBuckets.delete(id);
  }
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/** Keep only the trailing N user/assistant turns, and coerce to chat format. */
function normalizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0,
    )
    .slice(-MAX_MESSAGE_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
}

/**
 * Vercel decorates the response with Express-style `res.status().json()`
 * helpers, but a plain Node server does not. Using the raw API keeps this
 * handler portable and locally testable.
 */
function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!process.env.BASETEN_API_KEY) {
    sendJson(res, 503, { error: "Chat is not configured" });
    return;
  }

  maybeCleanup();
  const { ok, retryAfter } = checkRateLimit(clientId(req));
  if (!ok) {
    res.setHeader("Retry-After", String(retryAfter));
    sendJson(res, 429, { error: "Rate limit exceeded", retryAfter });
    return;
  }

  const body =
    typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const messages = normalizeMessages(body.messages);
  if (messages.length === 0) {
    sendJson(res, 400, { error: "No messages provided" });
    return;
  }

  let upstream;
  try {
    upstream = await fetch(`${BASETEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BASETEN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch (e) {
    sendJson(res, 502, { error: "Upstream request failed" });
    return;
  }

  if (!upstream.ok || !upstream.body) {
    // Deliberately opaque: upstream errors can echo request details.
    sendJson(res, 502, { error: "Upstream error", status: upstream.status });
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  // Upstream emits OpenAI SSE with both `reasoning_content` and `content`
  // deltas. Only the answer is forwarded, as a plain text stream, so the
  // client stays trivial and the model's scratchpad is never shown.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "" || payload === "[DONE]") continue;
        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch (e) {
          continue;
        }
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          res.write(delta);
        }
      }
    }
  } catch (e) {
    // client disconnected or upstream aborted
  } finally {
    res.end();
  }
};

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return {};
  }
}

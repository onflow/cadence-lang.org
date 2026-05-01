/**
 * /api/chat — server-only Claude chat endpoint with rate limiting + abuse caps.
 *
 * The ANTHROPIC_API_KEY env var is accessed exclusively in this server handler
 * and is never bundled into or exposed to the client.
 */
import { createFileRoute } from '@tanstack/react-router';
import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, streamText } from 'ai';

const SYSTEM_PROMPT = `You are an expert assistant for the Cadence programming language — \
a resource-oriented smart contract language for the Flow blockchain.

Your knowledge base is the Cadence documentation at https://cadence-lang.org. \
When answering, reference specific doc pages where relevant (e.g. "/docs/language/resources").

Guidelines:
- Be concise and technical. Developers are your audience.
- Use Cadence code examples when helpful.
- If you don't know, say so — never hallucinate API details.
- Key concepts: resources (@), capabilities, entitlements, access control, transactions, scripts.`;

// Abuse-protection knobs (decided in pr285-evaluation/findings.md F-007 triage):
const RATE_LIMIT_PER_MIN = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? 30);
const MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS ?? 2048);
const MAX_MESSAGE_HISTORY = Number(process.env.CHAT_MAX_MESSAGES ?? 8);
const ALLOWED_ORIGIN = process.env.CHAT_ALLOWED_ORIGIN ?? 'https://cadence-lang.org';
const MODEL = process.env.CHAT_MODEL ?? 'claude-sonnet-4-6';

// In-memory rate limiter — sliding 60s window per client IP.
// Single-region only; adequate for a docs site assistant. For a multi-region
// deployment this should move to Vercel KV / Upstash Redis.
type RateBucket = { hits: number[]; };
const rateBuckets = new Map<string, RateBucket>();

function clientId(request: Request): string {
  // Vercel sets x-forwarded-for; fall back to x-real-ip if behind a different proxy.
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(id: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - 60_000;
  let bucket = rateBuckets.get(id);
  if (!bucket) {
    bucket = { hits: [] };
    rateBuckets.set(id, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => t >= windowStart);
  if (bucket.hits.length >= RATE_LIMIT_PER_MIN) {
    const retryAfter = Math.max(1, Math.ceil((bucket.hits[0] + 60_000 - now) / 1000));
    return { ok: false, retryAfter };
  }
  bucket.hits.push(now);
  return { ok: true };
}

// Periodic cleanup of stale rate-limit entries (runs at most every 5 min)
let lastCleanup = 0;
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

function corsHeaders(origin: string | null): Record<string, string> {
  // Lock to ALLOWED_ORIGIN exactly. No wildcard. Same-origin requests (origin
  // matches ALLOWED_ORIGIN) and same-origin requests from the dev server pass.
  const allow =
    origin === ALLOWED_ORIGIN || (origin && origin.startsWith('http://localhost:'))
      ? origin
      : '';
  return allow
    ? {
        'Access-Control-Allow-Origin': allow,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin',
      }
    : {};
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        maybeCleanup();
        const origin = request.headers.get('origin');
        const cors = corsHeaders(origin);

        // CORS preflight is auto-handled by Nitro; but if a browser sends a
        // cross-origin POST without preflight (rare), reject without consuming
        // an Anthropic call.
        if (origin && !cors['Access-Control-Allow-Origin']) {
          return new Response(
            JSON.stringify({ error: 'Origin not allowed' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          );
        }

        // Rate limit
        const id = clientId(request);
        const rl = checkRateLimit(id);
        if (!rl.ok) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rl.retryAfter }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(rl.retryAfter ?? 60),
                ...cors,
              },
            },
          );
        }

        // API key lives only here — never sent to the client
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...cors } },
          );
        }

        // createAnthropic scopes the key to this server-side call only
        const anthropic = createAnthropic({ apiKey });

        const reqJson = await request.json();
        const incomingMessages = Array.isArray(reqJson.messages) ? reqJson.messages : [];
        // Cap message history (keep most-recent N to preserve continuity)
        const messages =
          incomingMessages.length > MAX_MESSAGE_HISTORY
            ? incomingMessages.slice(-MAX_MESSAGE_HISTORY)
            : incomingMessages;

        const result = streamText({
          model: anthropic(MODEL),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages, {
            ignoreIncompleteToolCalls: true,
          }),
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        });

        const response = result.toUIMessageStreamResponse();
        for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
        return response;
      },
      OPTIONS: async ({ request }) => {
        const origin = request.headers.get('origin');
        const cors = corsHeaders(origin);
        return new Response(null, { status: 204, headers: cors });
      },
    },
  },
});

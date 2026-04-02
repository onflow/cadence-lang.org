/**
 * /api/chat — server-only Claude chat endpoint.
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

export const Route = createFileRoute('/api/chat')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                // API key lives only here — never sent to the client
                const apiKey = process.env.ANTHROPIC_API_KEY;
                if (!apiKey) {
                    return new Response(
                        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } },
                    );
                }

                // createAnthropic scopes the key to this server-side call only
                const anthropic = createAnthropic({ apiKey });

                const reqJson = await request.json();

                const result = streamText({
                    model: anthropic('claude-opus-4-5'),
                    system: SYSTEM_PROMPT,
                    messages: await convertToModelMessages(reqJson.messages ?? [], {
                        ignoreIncompleteToolCalls: true,
                    }),
                });

                return result.toUIMessageStreamResponse();
            },
        },
    },
});

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { LSPManager } from './lsp/client.js';
import { createServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  // Shared LSP manager
  let lspManager: LSPManager | undefined;
  try {
    lspManager = new LSPManager(process.env.FLOW_CMD || 'flow', process.env.LSP_BINARY || undefined);
    await lspManager.getClient('mainnet');
    console.log('[cadence-mcp] LSP initialized');
  } catch (e) {
    console.warn('[cadence-mcp] LSP tools disabled:', (e as Error).message);
    lspManager = undefined;
  }

  const app = new Hono();
  app.use('*', cors());

  app.get('/health', (c) => c.json({ status: 'ok', lsp: !!lspManager }));

  // Stateless MCP endpoint: each request gets its own server+transport
  app.all('/mcp', async (c) => {
    try {
      const server = await createServer(lspManager);
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless
      });

      await server.connect(transport);
      return transport.handleRequest(c.req.raw);
    } catch (e) {
      console.error('[mcp] error:', e);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Use Bun's native server for proper Web Standard streaming
  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  console.log(`[cadence-mcp] HTTP server listening on port ${PORT}`);
  console.log(`[cadence-mcp] MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`[cadence-mcp] LSP tools: ${lspManager ? 'enabled' : 'disabled'}`);
}

main().catch(console.error);

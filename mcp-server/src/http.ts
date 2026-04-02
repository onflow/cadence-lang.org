import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { CadenceLSPClient, LSPManager, VALID_NETWORKS, type FlowNetwork } from './lsp/client.js';
import { createServer } from './server.js';
import { securityScan } from './audit.js';

/** Create the Hono app (extracted for testability) */
export function createApp(lspManager?: LSPManager) {
  const app = new Hono();
  app.use('*', cors());

  app.get('/health', (c) => c.json({ status: 'ok', lsp: !!lspManager }));

  // Direct REST endpoint for security scan — bypasses MCP/Claude for speed
  app.post('/api/security-scan', async (c) => {
    try {
      const body = await c.req.json();
      const { code, network } = body as { code?: string; network?: string };

      if (!code || typeof code !== 'string') {
        return c.json({ error: 'Missing required field: code' }, 400);
      }

      const net: FlowNetwork = VALID_NETWORKS.includes(network as FlowNetwork)
        ? (network as FlowNetwork)
        : 'mainnet';

      // Static regex scan (instant)
      const scanResult = securityScan(code);

      // LSP type check (if available)
      let diagnostics: string | undefined;
      if (lspManager) {
        try {
          const diags = await lspManager.checkCode(code, net);
          diagnostics = CadenceLSPClient.formatDiagnostics(diags);
        } catch (e: any) {
          diagnostics = `LSP check failed: ${e.message}`;
        }
      }

      return c.json({ scan: scanResult, diagnostics });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

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

  return app;
}

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

  const app = createApp(lspManager);

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

#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LSPManager } from './lsp/client.js';
import { createServer } from './server.js';

async function main() {
  // Try to start LSP manager if Flow CLI is available
  let lspManager: LSPManager | undefined;
  try {
    lspManager = new LSPManager(process.env.FLOW_CMD || 'flow', process.env.LSP_BINARY || undefined);
    // Pre-warm mainnet client
    await lspManager.getClient('mainnet');
    console.error('[cadence-mcp] LSP initialized (Flow CLI found)');
  } catch (e) {
    console.error(
      '[cadence-mcp] Flow CLI not found, LSP tools disabled. Doc tools still available.',
    );
    lspManager = undefined;
  }

  const server = await createServer(lspManager);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

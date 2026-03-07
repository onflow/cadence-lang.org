import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchDocs, getDoc, docsAvailable, browseDoc } from './search.js';
import { CadenceLSPClient, LSPManager, VALID_NETWORKS, type FlowNetwork } from './lsp/client.js';
import { fetchContractSource, toManifest, fetchSingleContractCode, securityScan, formatScanResult, executeScript } from './audit.js';

const networkSchema = z
  .enum(VALID_NETWORKS)
  .optional()
  .default('mainnet')
  .describe('Flow network for resolving imports (default: mainnet)');

export async function createServer(lspOrManager?: CadenceLSPClient | LSPManager): Promise<McpServer> {
  const server = new McpServer({
    name: 'cadence-mcp',
    version: '1.0.0',
  });

  // Normalize: wrap a single CadenceLSPClient into an LSPManager-like interface
  let lspManager: LSPManager | undefined;
  if (lspOrManager instanceof LSPManager) {
    lspManager = lspOrManager;
  } else if (lspOrManager instanceof CadenceLSPClient) {
    // Legacy single-client mode: wrap it so getClient() returns it
    const singleClient = lspOrManager;
    lspManager = {
      getClient: async () => singleClient,
      shutdown: async () => singleClient.shutdown(),
    } as LSPManager;
  }

  // --- Documentation tools (stateless, only if docs dir exists) ---

  const hasDocs = await docsAvailable();
  if (!hasDocs) {
    console.error('[cadence-mcp] Docs directory not found, doc tools disabled.');
  }

  if (hasDocs) {
  server.tool(
    'search_docs',
    'Search Cadence and Flow documentation by query',
    {
      query: z.string().describe('Search query'),
      top_n: z.number().optional().describe('Number of results (default 5)'),
    },
    async ({ query, top_n }) => {
      const results = await searchDocs(query, top_n ?? 5);
      const text = results
        .map(
          (r) =>
            `## ${r.title}\nPath: ${r.path}\n${r.description}\n\n${r.content.slice(0, 500)}...`,
        )
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: results.length ? text : `No results found for "${query}"`,
          },
        ],
      };
    },
  );

  server.tool(
    'get_doc',
    'Get full content of a specific documentation page (Cadence or Flow)',
    { path: z.string().describe('Document path, e.g. /docs/language/resources or /flow-docs/protocol/staking') },
    async ({ path }) => {
      const doc = await getDoc(path);
      if (!doc) {
        return {
          content: [{ type: 'text' as const, text: `Document not found: ${path}` }],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: `# ${doc.title}\nPath: ${doc.path}\n\n${doc.content}`,
          },
        ],
      };
    },
  );
  server.tool(
    'browse_docs',
    'Browse the documentation tree structure. Call with no path to see top-level categories, then drill down into sections.',
    {
      path: z.string().optional().describe('Path to browse, e.g. /docs/language. Omit for root.'),
    },
    async ({ path }) => {
      const node = await browseDoc(path);
      if (!node) {
        return {
          content: [{ type: 'text' as const, text: `No documentation node found at: ${path ?? '/'}` }],
        };
      }

      const lines: string[] = [`# ${node.title}`, `Path: ${node.path}`];
      if (node.description) lines.push(node.description);

      if (node.children?.length) {
        lines.push('', '## Children');
        for (const child of node.children) {
          const desc = child.description ? ` — ${child.description}` : '';
          lines.push(`- **${child.title}** (\`${child.path}\`)${desc}`);
        }
      }

      if (node.sections?.length) {
        lines.push('', '## Sections');
        for (const s of node.sections) {
          const indent = s.level === 3 ? '  ' : '';
          lines.push(`${indent}- ${s.heading}`);
        }
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    },
  );

  } // end hasDocs

  // --- LSP tools (require Flow CLI) ---

  if (lspManager) {
    server.tool(
      'cadence_check',
      'Check Cadence smart contract code for syntax and type errors. Returns diagnostics.',
      {
        code: z.string().describe('Cadence source code to check'),
        filename: z
          .string()
          .optional()
          .describe('Virtual filename (default: check.cdc)'),
        network: networkSchema,
      },
      async ({ code, filename, network }) => {
        const diagnostics = await lspManager.checkCode(code, network, filename);
        return {
          content: [
            {
              type: 'text' as const,
              text: CadenceLSPClient.formatDiagnostics(diagnostics),
            },
          ],
        };
      },
    );

    server.tool(
      'cadence_hover',
      'Get type information and documentation for a symbol at a given position in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        line: z.number().describe('0-based line number'),
        character: z.number().describe('0-based column number'),
        filename: z.string().optional().describe('Virtual filename'),
        network: networkSchema,
      },
      async ({ code, line, character, filename, network }) => {
        const result = await lspManager.hover(code, network, line, character, filename);
        return {
          content: [
            { type: 'text' as const, text: CadenceLSPClient.formatHover(result) },
          ],
        };
      },
    );

    server.tool(
      'cadence_definition',
      'Find the definition location of a symbol at a given position in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        line: z.number().describe('0-based line number'),
        character: z.number().describe('0-based column number'),
        filename: z.string().optional().describe('Virtual filename'),
        network: networkSchema,
      },
      async ({ code, line, character, filename, network }) => {
        const result = await lspManager.definition(code, network, line, character, filename);
        if (!result) {
          return {
            content: [
              { type: 'text' as const, text: 'No definition found.' },
            ],
          };
        }
        const loc = Array.isArray(result) ? result[0] : result;
        const pos = loc.range?.start;
        return {
          content: [
            {
              type: 'text' as const,
              text: `Definition: ${loc.uri} at line ${(pos?.line ?? 0) + 1}:${(pos?.character ?? 0) + 1}`,
            },
          ],
        };
      },
    );

    server.tool(
      'cadence_symbols',
      'List all symbols (contracts, resources, functions, events, etc.) in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        filename: z.string().optional().describe('Virtual filename'),
        network: networkSchema,
      },
      async ({ code, filename, network }) => {
        const symbols = await lspManager.symbols(code, network, filename);
        return {
          content: [
            {
              type: 'text' as const,
              text: CadenceLSPClient.formatSymbols(symbols || []),
            },
          ],
        };
      },
    );
  }

  // --- Audit tools ---

  server.tool(
    'get_contract_source',
    'Fetch on-chain contract manifest from a Flow address: lists all contracts with names, sizes, imports, and dependency graph. Does NOT include source code — use get_contract_code to fetch individual contract source.',
    {
      address: z.string().describe('Flow address (0x...) to fetch contracts from'),
      network: networkSchema,
      recurse: z
        .boolean()
        .optional()
        .default(true)
        .describe('Recursively fetch imported dependency contracts (default: true)'),
    },
    async ({ address, network, recurse }) => {
      try {
        const tree = await fetchContractSource(address, network, recurse);
        const manifest = toManifest(tree);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(manifest, null, 2),
            },
          ],
        };
      } catch (e: any) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error fetching contracts: ${e.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get_contract_code',
    'Fetch the source code of a specific contract from a Flow address. Use get_contract_source first to discover contract names.',
    {
      address: z.string().describe('Flow address (0x...) that holds the contract'),
      contract_name: z.string().optional().describe('Name of the contract to fetch. If omitted, returns all contracts on the address.'),
      network: networkSchema,
    },
    async ({ address, contract_name, network }) => {
      try {
        const contracts = await fetchSingleContractCode(address, network, contract_name);
        const parts = contracts.map((c) => `// === ${c.name} (${address}) ===\n\n${c.source}`);
        return {
          content: [
            {
              type: 'text' as const,
              text: parts.join('\n\n'),
            },
          ],
        };
      } catch (e: any) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error fetching contract code: ${e.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'cadence_security_scan',
    'Run static security analysis rules on Cadence source code. Returns structured findings with severity levels.',
    {
      code: z.string().describe('Cadence source code to scan'),
      network: networkSchema,
    },
    async ({ code, network }) => {
      // Run static security scan
      const scanResult = securityScan(code);
      const parts: string[] = [formatScanResult(scanResult)];

      // Also run LSP type-check if available
      if (lspManager) {
        try {
          const diagnostics = await lspManager.checkCode(code, network);
          const diagText = CadenceLSPClient.formatDiagnostics(diagnostics);
          parts.push('', '## Type Check (LSP)', diagText);
        } catch (e: any) {
          parts.push('', '## Type Check (LSP)', `LSP check failed: ${e.message}`);
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: parts.join('\n'),
          },
        ],
      };
    },
  );

  server.tool(
    'cadence_execute_script',
    'Execute a read-only Cadence script on Flow network. Scripts can query on-chain state like balances, contract data, and account info. Cannot modify state.',
    {
      code: z.string().describe('Cadence script code to execute (must have a `access(all) fun main()` entry point)'),
      network: networkSchema,
      args: z
        .array(z.string())
        .optional()
        .default([])
        .describe('Script arguments in Flow CLI format: ["Type:Value", ...], e.g. ["Address:0x1654653399040a61", "UFix64:10.0"]'),
    },
    async ({ code, network, args }) => {
      const result = await executeScript(code, network, args);
      if (result.error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Script execution failed:\n${result.error}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: result.value,
          },
        ],
      };
    },
  );

  return server;
}

# cadence-lang.org

The official documentation site for [Cadence](https://github.com/onflow/cadence), the resource-oriented programming language for the [Flow blockchain](https://flow.com).

Live at [cadence-lang.org](https://cadence-lang.org).

## AI Integration

### Skills

Install Flow's Claude Code skill suite from the [`onflow/flow-ai-tools`](https://github.com/onflow/flow-ai-tools) marketplace. In Claude Code:

```bash
/plugin marketplace add onflow/flow-ai-tools
/plugin install flow-dev@flow-ai-tools
/reload-plugins
```

### MCP Server

The Cadence MCP server is built into the [Flow CLI](https://developers.flow.com/tools/flow-cli) (≥ v2.16.0) as `flow mcp`. Source: [onflow/flow-cli/internal/mcp](https://github.com/onflow/flow-cli/tree/master/internal/mcp).

```sh
claude mcp add --scope user cadence-mcp -- flow mcp
```

### LLM Context

| Endpoint | Description |
|----------|-------------|
| [cadence-lang.org/llms.txt](https://cadence-lang.org/llms.txt) | Cadence doc index for LLMs |
| [cadence-lang.org/llms-full.txt](https://cadence-lang.org/llms-full.txt) | Full Cadence documentation as plain text |

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — SSR framework with file-based routing
- [Fumadocs](https://fumadocs.vercel.app/) — MDX documentation engine
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Shiki](https://shiki.style/) — syntax highlighting with custom Cadence TextMate grammar
- [@vercel/og](https://vercel.com/docs/functions/og-image-generation) — dynamic OG image generation
- Deployed on [Vercel](https://vercel.com)

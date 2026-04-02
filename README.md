# cadence-lang.org

The official documentation site for [Cadence](https://github.com/onflow/cadence), the resource-oriented programming language for the [Flow blockchain](https://flow.com).

Live at [cadence-lang.org](https://cadence-lang.org).

## AI Integration

### Skills

Install the Cadence skill for your AI coding agent:

```sh
npx skills add outblock/cadence-lang.org
```

### MCP Server

Install the [Cadence MCP server](https://www.npmjs.com/package/@outblock/cadence-mcp) for AI-powered Cadence development — code checking, type info, and doc search:

```sh
npx install-mcp @outblock/cadence-mcp --client claude
```

Supported clients: `claude`, `cursor`, `windsurf`, `copilot`, `vscode`

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

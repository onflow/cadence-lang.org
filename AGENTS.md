# AGENTS.md

Guidance for AI coding agents working in this repository. Loaded into agent context — keep concise.

## Overview

`cadence-lang.org` is the documentation and marketing site for the Cadence smart contract programming language (Flow network). Built with TanStack Start (file-based routing + Nitro SSR) + Fumadocs (MDX docs engine) + Tailwind CSS v4 + Bun. Deployed on Vercel. Includes AI chat (`/api/chat`), Orama-powered search (federated with onflow/docs via the `external/onflow-docs` submodule), and `/llms.txt` + `/llms-full.txt` LLM-optimized endpoints. The Cadence MCP server is built into the Flow CLI as `flow mcp` ([source](https://github.com/onflow/flow-cli/tree/master/internal/mcp)), not bundled here.

## Build and Test Commands

Bun ≥ 1.0 required. Node ≥ 22 (Vercel uses 24.x). Flow CLI ≥ v2.16.0 for `flow mcp`.

- `bun install` — install dependencies (run after pulling submodule changes too)
- `bun run dev` — local dev server at http://localhost:3000
- `bun run build` — production build into `.vercel/output/` + sitemap generation. `NODE_OPTIONS=--max-old-space-size=8192` is baked into the script (the SSR `source-*.mjs` chunk is ~13 MB and OOMs on default heap).
- `bun run start` — serve the built server (`bun .output/server/index.mjs`)
- `bun run types:check` — `fumadocs-mdx && tsc --noEmit`. May report errors against the `external/onflow-docs` submodule's own files; those are out-of-scope for this repo.
- `git submodule update --init --recursive` — populate `external/onflow-docs` (required before search index can include onflow-docs content)

No site-build CI in this repo — Vercel builds previews on every PR push.

## Stack and Toolchain

- **Bun is the toolchain.** Don't introduce npm/yarn lock files — `bun.lock` is the source of truth.
- **TanStack Start** — file-based routing under `src/routes/`. Nitro adapter for SSR (Vercel preset). `src/routeTree.gen.ts` is auto-generated.
- **Fumadocs** — `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`. Source loader at `src/lib/source.ts`. MDX config in `source.config.ts`.
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (no config file). Theme tokens are CSS variables in `src/styles/app.css`. Use `cn()` from `src/lib/cn.ts` for class merging.
- **`@vercel/og`** — server-side OG images via Satori + resvg-wasm.
- **Dark mode** uses the `dark` class on `<html>` (Fumadocs convention).

## Conventions and Gotchas

These are the things a competent dev would otherwise get wrong.

- **`NODE_OPTIONS=--max-old-space-size=8192` is required for builds.** Baked into `package.json`. The SSR `source-*.mjs` chunk grew past the 4 GB default heap when the `external/onflow-docs` submodule was added. Don't strip the flag.
- **Submodule pin is deliberate, not branch-tracking.** `external/onflow-docs` points to a specific commit. Bumping it is a semi-supply-chain action — review the diff.
- **Satori (the `@vercel/og` renderer) cannot render SVG `<path>` elements.** For per-doc OG images at `og.docs.$.tsx`, use PNG base64 data URIs via `src/lib/og-icon.ts`. Inline SVG paths will silently fail.
- **URL redirects belong in `vercel.json`**, not page frontmatter. When moving or renaming a page, add the redirect there.
- **Server-only handlers use the TanStack pattern:**

```ts
  export const Route = createFileRoute('/api/example')({
    server: {
      handlers: {
        GET: async ({ request }) => { /* ... */ },
      },
    },
  });
```
  
  See `src/routes/api/chat.ts` and `src/routes/api/search.ts`. `ANTHROPIC_API_KEY` is server-only and never reaches the browser bundle.

- **Section / page ordering is per-folder `meta.json`** (Fumadocs convention; replaces Docusaurus `_category_.json`).
- **MDX frontmatter shape:**

```yaml
  ---
  title: Page Title
  description: One-line description for OG and search.
  icon: optional-icon-name
  slug: optional-url-override
  ---
```

- **Cadence syntax highlighting** uses a custom TextMate grammar at `src/lib/cadence.tmLanguage.json`. Shiki dual themes (`github-light` / `github-dark`) are CSS-variable controlled in `src/styles/app.css`.
- **Admonition types** (defined in `source.config.ts`): `note`, `tip`, `info`, `warn`, `warning`, `danger`, `important`, `success`. Don't invent new ones without updating the schema.
- **`external/onflow-docs` is indexed for search but not rendered in the docs nav.** Cross-site search hits link out to `developers.flow.com`.
- **Licensing is split:** source under Apache 2.0 (`LICENSE.txt`), content under CC-BY-4.0 (`CC-BY-4.0.txt`). See `LICENSE.md`.

## AI Surfaces

- **`/api/chat`** — Anthropic streaming via `@ai-sdk/anthropic`. Server-only key.
- **Search** — Orama index over `content/docs/` + `external/onflow-docs/`. Panel at `src/components/search.tsx`, Cmd+/ hotkey, localStorage persistence.
- **`/llms.txt`** / **`/llms-full.txt`** — TanStack server routes emitting LLM-optimized markdown.
- **MCP server** — `flow mcp` (Flow CLI, ≥ v2.16.0). Tools: `cadence_check`, `cadence_hover`, `cadence_definition`, `cadence_symbols`, `cadence_completion`, `get_contract_source`, `get_contract_code`, `cadence_execute_script`. stdio transport. Source: [onflow/flow-cli/internal/mcp](https://github.com/onflow/flow-cli/tree/master/internal/mcp); maintained by Flow DX.

## Permission Boundaries

### ✅ Always
- Run `bun run types:check` before committing.
- Use `cn()` for class merging; don't string-concatenate Tailwind classes.
- Add URL redirects to `vercel.json` when renaming or moving a page.

### ⚠️ Ask first
- Bumping the `external/onflow-docs` submodule pin (review the diff; it affects search corpus and `bun run build` memory).
- Adding or removing admonition types in `source.config.ts`.
- Adding a new top-level runtime dependency (`bun add ...`).
- Modifying existing entries in `vercel.json` (vs. adding new ones).
- Changing the `NODE_OPTIONS` build flag.

### 🚫 Never
- Commit `.env*` files or any secret. `ANTHROPIC_API_KEY` is server-only.
- Edit `bun.lock` by hand — regenerate via `bun install`.
- Edit `src/routeTree.gen.ts`, `.source/`, `.vercel/output/`, `node_modules/`, or `build/` — all auto-generated.
- Edit files inside `external/onflow-docs/` directly. To change content there, modify the upstream `onflow/docs` repo and bump the submodule pin.
- Introduce npm or yarn lock files.

## Notes

Programmatic checks specified here are advisory — agents may skip them. CI on Vercel enforces the build on PR.

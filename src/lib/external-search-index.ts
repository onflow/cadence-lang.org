/**
 * Build a search index over the external/onflow-docs git submodule so the
 * docs-site search panel federates results from developers.flow.com alongside
 * the local cadence-lang.org content.
 *
 * The submodule pins onflow/docs which deploys to https://developers.flow.com/
 * with `routeBasePath: '/'`, so a file like
 *   external/onflow-docs/docs/ecosystem/projects.mdx
 * is published at
 *   https://developers.flow.com/ecosystem/projects
 *
 * Index entries are tagged 'external' so consumers can render them with a
 * cross-site badge ("↗ developers.flow.com") rather than treat them as
 * cadence-lang.org pages.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename, relative, dirname } from 'node:path';
import matter from 'gray-matter';
import type { AdvancedIndex } from 'fumadocs-core/search/server';

const SUBMODULE_DIR = join(process.cwd(), 'external', 'onflow-docs', 'docs');
const PUBLISHED_BASE = 'https://developers.flow.com';

async function walkMdx(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkMdx(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function urlFromPath(absoluteFile: string): string {
  const rel = relative(SUBMODULE_DIR, absoluteFile).replace(/\\/g, '/');
  const name = basename(rel, extname(rel));
  const dir = dirname(rel);
  // Docusaurus drops numeric prefixes from sidebar_position-style filenames
  // when computing URL slugs (e.g. "02-resources.md" → "/resources").
  const cleanName = name.replace(/^\d+-/, '');
  let path: string;
  if (cleanName === 'index') {
    path = dir === '.' ? '' : dir.split('/').map((seg) => seg.replace(/^\d+-/, '')).join('/');
  } else {
    const dirParts = dir === '.' ? [] : dir.split('/').map((seg) => seg.replace(/^\d+-/, ''));
    path = [...dirParts, cleanName].join('/');
  }
  return path ? `${PUBLISHED_BASE}/${path}` : PUBLISHED_BASE;
}

/**
 * Truncate body content for search indexing. We don't want to index every byte
 * of 453 docs (memory / cold-start cost); the first ~2KB per page covers
 * intro + first few headings, which is what users typically search for.
 */
function trimContent(raw: string, max = 2000): string {
  if (raw.length <= max) return raw;
  // Cut at paragraph boundary if possible
  const cut = raw.slice(0, max);
  const lastBreak = cut.lastIndexOf('\n\n');
  return (lastBreak > max * 0.5 ? cut.slice(0, lastBreak) : cut) + '…';
}

export async function buildExternalIndexes(): Promise<AdvancedIndex[]> {
  if (!existsSync(SUBMODULE_DIR)) return [];

  const files = await walkMdx(SUBMODULE_DIR);
  const indexes: AdvancedIndex[] = [];

  for (const file of files) {
    try {
      const raw = await readFile(file, 'utf8');
      const fm = matter(raw);
      const data = fm.data as { title?: string; description?: string };
      const url = urlFromPath(file);
      const title = data.title ?? basename(file, extname(file));
      const id = `external:${url}`;

      // Minimal structuredData — single content block from the trimmed body.
      // Heading is empty so it's treated as page-level body text. Full-fidelity
      // heading extraction would require an MDX AST walk per page; not worth
      // the cold-start cost for federated cross-site results.
      const content = trimContent(fm.content.trim());

      indexes.push({
        id,
        title,
        description: data.description,
        url,
        tag: 'external',
        structuredData: {
          headings: [],
          contents: [{ content, heading: undefined }],
        } as any,
      });
    } catch {
      // Skip pages with malformed frontmatter — log silently
    }
  }

  return indexes;
}

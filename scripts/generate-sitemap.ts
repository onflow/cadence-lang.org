/**
 * Generate sitemap.xml from content/docs.
 * Run: bun scripts/generate-sitemap.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const SITE_URL = 'https://cadence-lang.org';
const DOCS_DIR = join(import.meta.dirname, '..', 'content', 'docs');

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(DOCS_DIR);
  const urls: string[] = [
    SITE_URL,
    `${SITE_URL}/community`,
    `${SITE_URL}/llms.txt`,
  ];

  for (const file of files) {
    const rel = file.replace(DOCS_DIR, '').replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/[^/]+$/, '');

    const slug = name === 'index' ? dir : `${dir}/${name}`;
    urls.push(`${SITE_URL}/docs${slug}`);
  }

  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;

  await writeFile(join(import.meta.dirname, '..', 'public', 'sitemap.xml'), xml);
  console.log(`Generated sitemap.xml with ${urls.length} URLs`);
}

main().catch(console.error);

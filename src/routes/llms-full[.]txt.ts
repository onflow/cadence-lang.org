import { createFileRoute } from '@tanstack/react-router';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename, relative } from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = join(process.cwd(), 'content', 'docs');

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const files = (await walk(DOCS_DIR)).sort();
        const sections: string[] = [];

        for (const file of files) {
          const rel = relative(DOCS_DIR, file).replace(/\\/g, '/');
          const name = basename(rel, extname(rel));
          const dir = rel.replace(/\/?[^/]+$/, '');
          const slug = name === 'index' ? dir : dir ? `${dir}/${name}` : name;
          const url = slug ? `/docs/${slug}` : '/docs';

          const raw = await readFile(file, 'utf8');
          const fm = matter(raw);
          const title = (fm.data.title as string | undefined) ?? slug ?? 'Cadence Documentation';

          sections.push(`# ${title} (${url})\n\n${fm.content.trim()}`);
        }

        return new Response(sections.join('\n\n---\n\n'), {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});

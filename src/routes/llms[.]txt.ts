import { createFileRoute } from '@tanstack/react-router';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename, relative } from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = join(process.cwd(), 'content', 'docs');

type Entry = { url: string; title: string; description?: string; section: string };

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Pages whose first URL segment matches a key here get grouped under that section.
// Anything else (top-level standalone pages, the docs root) goes into "Topical Guides".
const SECTION_TITLES: Record<string, string> = {
  'ai-tools': 'AI Tools',
  'cadence-migration-guide': 'Cadence 1.0 Migration Guide',
  language: 'Language Reference',
  tutorial: 'Tutorial',
};

async function collectEntries(): Promise<Entry[]> {
  const files = await walk(DOCS_DIR);
  const entries: Entry[] = [];

  for (const file of files) {
    const rel = relative(DOCS_DIR, file).replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/?[^/]+$/, '');
    const slug = name === 'index' ? dir : dir ? `${dir}/${name}` : name;
    const url = slug ? `/docs/${slug}` : '/docs';

    const raw = await readFile(file, 'utf8');
    const fm = matter(raw);
    const title = (fm.data.title as string | undefined) ?? slug ?? 'Cadence Documentation';
    const description = fm.data.description as string | undefined;

    const firstSegment = slug.split('/')[0] || '';
    const section = SECTION_TITLES[firstSegment] ?? 'Topical Guides';
    entries.push({ url, title, description, section });
  }

  entries.sort((a, b) => a.section.localeCompare(b.section) || a.url.localeCompare(b.url));
  return entries;
}

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const entries = await collectEntries();
        const grouped: Record<string, Entry[]> = {};
        for (const e of entries) (grouped[e.section] ||= []).push(e);
        // Stable display order for top-level sections; everything unknown sorts after.
        const sectionOrder = [
          'Language Reference',
          'Tutorial',
          'Topical Guides',
          'Cadence 1.0 Migration Guide',
          'AI Tools',
        ];
        const remaining = Object.keys(grouped)
          .filter((s) => !sectionOrder.includes(s))
          .sort();
        const orderedSections = [...sectionOrder.filter((s) => grouped[s]), ...remaining];

        const lines: string[] = [
          '# Cadence Programming Language',
          '',
          '> Cadence is a resource-oriented programming language for smart contracts on Flow.',
          '> It features strong static types, resource-oriented programming, and capability-based access control.',
          '',
          '> Full docs corpus: https://cadence-lang.org/llms-full.txt',
          '> Per-page raw markdown: append `.mdx` to any docs URL (e.g. /docs/language/resources.mdx)',
          '',
        ];

        for (const section of orderedSections) {
          lines.push(`## ${section}`, '');
          for (const e of grouped[section]) {
            const desc = e.description ? `: ${e.description}` : '';
            lines.push(`- [${e.title}](https://cadence-lang.org${e.url})${desc}`);
          }
          lines.push('');
        }

        return new Response(lines.join('\n'), {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const pages = source.getPages().sort((a, b) => a.url.localeCompare(b.url, 'en'));

        const rendered = await Promise.all(
          pages.map(async (page) => {
            const title = (page.data.title as string | undefined) ?? page.url;
            const desc = page.data.description as string | undefined;
            const processed = await page.data.getText('processed').catch(() => '');
            if (!processed.trim()) return null;
            const header = desc
              ? `# ${title} (${page.url})\n\n> ${desc}`
              : `# ${title} (${page.url})`;
            return `${header}\n\n${processed.trim()}`;
          }),
        );

        const body = rendered.filter((x): x is string => x !== null).join('\n\n---\n\n');
        return new Response(body, {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});

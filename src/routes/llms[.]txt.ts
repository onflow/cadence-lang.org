import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const pages = source.getPages();
        const lines = [
          '# Cadence Programming Language',
          '',
          '> Cadence is a resource-oriented programming language for smart contracts on Flow.',
          '> It features strong static types, resource-oriented programming, and capability-based access control.',
          '',
          `> Full docs: https://cadence-lang.org/llms-full.txt`,
          '',
          '## Documentation Pages',
          '',
          ...pages.map(
            (page) =>
              `- [${page.data.title}](https://cadence-lang.org${page.url})`,
          ),
        ];

        return new Response(lines.join('\n'));
      },
    },
  },
});

import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { remarkDirectiveAdmonition } from 'fumadocs-core/mdx-plugins';
import cadenceGrammar from './src/lib/cadence.tmLanguage.json';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkDirective,
      [
        remarkDirectiveAdmonition,
        {
          types: {
            note: 'info',
            tip: 'info',
            info: 'info',
            warn: 'warning',
            warning: 'warning',
            danger: 'error',
            important: 'warning',
            success: 'success',
          },
        },
      ],
    ],
    rehypeCodeOptions: {
      langs: [cadenceGrammar as never],
    },
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { basename, extname } from 'node:path';
import { source } from '@/lib/source';
import {
  createFromSource,
  createSearchAPI,
  type AdvancedIndex,
} from 'fumadocs-core/search/server';
import { buildExternalIndexes } from '@/lib/external-search-index';

/**
 * Build an AdvancedIndex entry for a local cadence-lang.org page.
 * Mirrors fumadocs' buildIndexDefault, with two additions:
 *  - injects frontmatter `keywords` as a synthetic content block so Orama
 *    indexes them (default schema ignores keywords).
 *  - tags entries 'local' for filtering (paired with the 'external' tag
 *    used for federated developers.flow.com results).
 */
async function buildLocalIndex(page: any): Promise<AdvancedIndex> {
  let structuredData: any;
  const data: any = page.data;
  if ('structuredData' in data) {
    structuredData =
      typeof data.structuredData === 'function'
        ? await data.structuredData()
        : data.structuredData;
  } else if ('load' in data && typeof data.load === 'function') {
    structuredData = (await data.load()).structuredData;
  }
  if (!structuredData) {
    throw new Error('Cannot find structured data from page');
  }

  const keywords = Array.isArray(data.keywords) ? data.keywords : [];
  if (keywords.length > 0) {
    structuredData = {
      ...structuredData,
      contents: [
        ...(structuredData.contents ?? []),
        { content: `Keywords: ${keywords.join(', ')}`, heading: undefined },
      ],
    };
  }

  return {
    id: page.url,
    title: data.title ?? basename(page.path, extname(page.path)),
    description: data.description,
    url: page.url,
    tag: 'local',
    structuredData,
  };
}

// Lazily build the combined index (local cadence-lang.org + external onflow-docs).
// Runs once at module load (per server cold start). 453 onflow-docs pages
// × ~2KB content snippets adds ~1MB to memory and a few hundred ms to startup;
// far cheaper than running two parallel search servers.
const indexesPromise: Promise<AdvancedIndex[]> = (async () => {
  const localPages = source.getPages();
  const localIndexes = await Promise.all(localPages.map(buildLocalIndex));
  const externalIndexes = await buildExternalIndexes();
  return [...localIndexes, ...externalIndexes];
})();

const server = createSearchAPI('advanced', {
  language: 'english',
  indexes: () => indexesPromise,
});

// Removed earlier biasLocalFirst variants. Two iterations of "local-first" bias
// caused the federation regression M5 exhaustive caught:
//   v1 (3f0ada5): strict partition — all locals before any external. Weak-match
//                 local pages (e.g. /docs/ai-tools/skills mentions FCL once)
//                 outranked relevant external pages. 6/7 federation queries
//                 failed.
//   v2 (this commit, attempt 1): bubble first local to position 0. Same root
//                 cause — weak local still bubbled over strong external.
// Conclusion: trust Orama's term-frequency scoring. Federated results from
// developers.flow.com that match a query better than any local page WILL
// rank higher, which is correct. No post-sort bias.

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => server.GET(request),
    },
  },
});

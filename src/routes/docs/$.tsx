import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { source, getPageImage } from '@/lib/source';
import { SITE_URL } from '@/lib/site';
import browserCollections from 'fumadocs-mdx:collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { AnchorHTMLAttributes } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense } from 'react';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from '@/components/search';
import { MessageCircleIcon } from 'lucide-react';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} | Cadence`
      : 'Cadence Documentation';
    const description =
      loaderData?.description ||
      'Cadence programming language documentation';
    const url = `${SITE_URL}/docs/${loaderData?.slugs?.join('/') || ''}`;

    const ogImage = loaderData?.ogImage || '';

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: `${SITE_URL}${ogImage}` },
        { property: 'og:site_name', content: 'Cadence' },
        { property: 'og:logo', content: `${SITE_URL}/img/logo.svg` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: `${SITE_URL}${ogImage}` },
      ],
      links: [
        { rel: 'canonical', href: url },
      ],
    };
  },
});

/**
 * Derive a meta description from the page's first non-heading paragraph
 * when frontmatter `description` is absent. Strips common MDX/markdown
 * syntax (links, bold/italic, inline code, JSX components, headings) and
 * truncates at 160 chars on a word boundary.
 */
function deriveDescription(processedMarkdown: string): string {
  const blocks = processedMarkdown.split(/\n{2,}/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Skip headings, frontmatter fences, code blocks, JSX components, lists, blockquotes
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('---') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('>') ||
      /^\s*\d+\.\s/.test(trimmed) ||
      trimmed.startsWith(':::')
    ) {
      continue;
    }
    // Skip lines that are processed-MDX heading text + anchor like "Introduction [#introduction]"
    // (the heading-id syntax some MDX pipelines emit instead of '## ...')
    if (/^\S[^\n]{0,80}\[#[\w-]+\]\s*$/.test(trimmed)) continue;
    // Strip markdown syntax: [text](url) → text, **x**/*x*/`x` → x, <Component/> → '',
    // and inline anchor markers like [#some-id]
    const plain = trimmed
      .replace(/\[#[\w-]+\]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (plain.length < 20) continue;
    if (plain.length <= 160) return plain;
    // Truncate on word boundary, append ellipsis
    const cut = plain.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut) + '…';
  }
  return '';
}

const serverLoader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    let description = page.data.description as string | undefined;
    if (!description) {
      try {
        const processed = await page.data.getText('processed');
        description = deriveDescription(processed);
      } catch {
        // fall through to undefined → consumers handle the empty case
      }
    }

    return {
      path: page.path,
      url: page.url,
      title: page.data.title,
      description: description || undefined,
      ogImage: getPageImage(page).url,
      slugs,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const FumadocsLink = defaultMdxComponents.a;

function normalizeDocsRoute(pathname: string) {
  if (pathname === '/docs/index') return '/docs';
  return pathname.replace(/\/index$/, '');
}

function createResolvedLink(docPath: string) {
  return function ResolvedLink({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    let resolved = href;
    if (href && (href.startsWith('./') || href.startsWith('../'))) {
      try {
        const base = new URL(`/docs/${docPath.replace(/^\/+/, '')}`, 'https://p.com');
        const target = new URL(href, base);
        resolved = normalizeDocsRoute(target.pathname) + target.search + target.hash;
      } catch {
        // keep original href on parse failure
      }
    }
    return <FumadocsLink href={resolved} {...props} />;
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    props: { className?: string; pageUrl?: string; docPath?: string },
  ) {
    const markdownUrl = `${props.pageUrl}.mdx`;
    const githubDocPath = props.docPath
      ? `${props.docPath}.mdx`
      : `${props.pageUrl?.replace('/docs', '') || ''}.mdx`;
    const githubUrl = `https://github.com/onflow/cadence-lang.org/blob/main/content/docs/${githubDocPath.replace(/^\/+/, '')}`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: frontmatter.title,
      description: frontmatter.description || '',
      url: props.pageUrl ? `${SITE_URL}${props.pageUrl}` : '',
      author: {
        '@type': 'Organization',
        name: 'Flow Foundation',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Cadence',
        url: SITE_URL,
      },
    };

    // Strip our custom props before spreading — DocsPage forwards unknown
    // attrs to a DOM element, and 'pageUrl' / 'docPath' aren't valid HTML
    // attributes. M10 console-network sweep flagged this on every docs page.
    const { pageUrl: _pageUrl, docPath: _docPath, ...domSafeProps } = props;
    return (
      <DocsPage
        toc={toc}
        tableOfContent={{
          style: 'clerk',
        }}
        {...domSafeProps}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b pb-4 mb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
              a: props.docPath
                ? createResolvedLink(props.docPath)
                : defaultMdxComponents.a,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  return (
    <AISearch>
      <AISearchPanel />
      {/* Floating Cadence AI button — bottom-right */}
      <AISearchTrigger
        position="float"
        className="bg-fd-primary text-fd-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium"
      >
        <MessageCircleIcon className="size-4" />
        Ask Cadence AI
      </AISearchTrigger>
      <DocsLayout
        {...baseOptions()}
        tree={data.pageTree}
        links={[
          { text: 'Documentation', url: '/docs' },
          { text: 'Language Reference', url: '/docs/language' },
          { text: 'Agents', url: '/docs/ai-tools' },
          { text: 'Community & Support', url: '/community' },
          ...(baseOptions().links ?? []).filter((l: { type?: string }) => l.type === 'icon'),
        ]}
      >
        {/* `display: contents` keeps the <main> landmark for a11y/Lighthouse
         * (landmark-one-main, button-name etc.) without disrupting fumadocs'
         * CSS-Grid layout, which uses `[grid-area:main]` on a direct child of
         * DocsLayout. Without `display: contents`, this wrapper became a grid
         * child and the actual article (now a grandchild) couldn't claim its
         * named area, forcing the grid to a fixed 872px first column on every
         * viewport (M8 visual regression — 10/60 fails on mobile/tablet docs
         * pages). */}
        <main aria-label="Documentation content" style={{ display: 'contents' }}>
          <Suspense>
            {clientLoader.useContent(data.path, {
              className: '',
              pageUrl: data.url,
              docPath: data.path,
            })}
          </Suspense>
        </main>
      </DocsLayout>
    </AISearch>
  );
}

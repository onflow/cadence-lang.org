import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';
import appCss from '@/styles/app.css?url';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { SITE_URL } from '@/lib/site';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Cadence - Smart Contracts Built for the AI Era' },
      {
        name: 'description',
        content:
          'A safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.',
      },
      { property: 'og:site_name', content: 'Cadence' },
      { property: 'og:logo', content: `${SITE_URL}/img/logo.svg` },
      { property: 'og:locale', content: 'en_US' },
      { name: 'theme-color', content: '#00D87E' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: import.meta.env.VITE_GTAG
      ? [
          {
            src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GTAG}`,
            async: true,
          },
          {
            children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GTAG}');`,
          },
          {
            children: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:5179370,hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
          },
        ]
      : [],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function NotFound() {
  const router = useRouter();
  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : '';

  const issueTitle = encodeURIComponent(`404: Broken link — ${currentUrl}`);
  const issueBody = encodeURIComponent(
    `## Broken Link Report\n\nI followed a link that resulted in a 404 error.\n\n**URL:** ${currentUrl}\n\n**Steps to reproduce:**\n1. Navigate to ${currentUrl}\n\n**Expected:** A valid page\n**Actual:** 404 Not Found\n\n---\n*Reported automatically via the 404 page.*`,
  );
  const githubIssueUrl = `https://github.com/onflow/cadence/issues/new?title=${issueTitle}&body=${issueBody}&labels=documentation`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
          style={{ background: 'var(--accent)' }}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <div
          className="font-mono font-bold select-none leading-none"
          style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            color: 'var(--accent)',
            textShadow:
              '0 0 60px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
        >
          404
        </div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          Page not found
        </h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          The page you're looking for doesn't exist or was moved. If you
          followed a link from another page, it may be broken.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full">
          <Link
            to="/docs"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
              borderColor: 'var(--accent)',
            }}
          >
            Go to Docs
          </Link>
          <button
            onClick={() => router.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              background: 'transparent',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
            }}
          >
            ← Go Back
          </button>
        </div>
        <a
          href={githubIssueUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors mt-1"
          style={{
            color: 'var(--muted)',
            borderColor: 'var(--border)',
            background: 'transparent',
          }}
        >
          Report broken link
        </a>
        <Link
          to="/"
          className="text-sm transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          ← Back to cadence-lang.org
        </Link>
      </div>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: 'dark' }}>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}

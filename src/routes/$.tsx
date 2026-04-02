import { createFileRoute, Link, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: NotFound,
  head: () => ({
    meta: [
      { title: '404 — Page Not Found | Cadence' },
      { name: 'description', content: 'This page could not be found.' },
    ],
  }),
});

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
      {/* Glowing accent orb */}
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
        {/* 404 number */}
        <div
          className="font-mono font-bold select-none leading-none"
          style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            color: 'var(--accent)',
            textShadow: '0 0 60px color-mix(in srgb, var(--accent) 40%, transparent)',
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
          The page you're looking for doesn't exist or was moved. If you followed
          a link from another page, it may be broken.
        </p>

        {/* Actions */}
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

        {/* Report button */}
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
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              'var(--accent)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              'var(--accent)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              'var(--border)';
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="15"
            height="15"
            aria-hidden
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Report broken link
        </a>

        {/* Home link */}
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

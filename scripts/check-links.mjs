#!/usr/bin/env node

/**
 * Link checker for cadence-lang.org
 * Crawls the local dev server and reports broken same-origin links.
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. Run: node scripts/check-links.mjs [--base http://localhost:3000] [--start /docs]
 */

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index !== -1 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/{2,}/g, '/');
  if (normalized === '/') return normalized;
  return normalized.replace(/\/+$/, '') || '/';
}

const BASE_URL = new URL(getArgValue('--base', 'http://localhost:3000'));
const SITE_URL = new URL(getArgValue('--site-origin', 'https://cadence-lang.org'));
const START = getArgValue('--start', '/docs');
const INTERNAL_ORIGINS = new Set([BASE_URL.origin, SITE_URL.origin]);

function buildTargetKey(url) {
  return `${normalizePathname(url.pathname)}${url.search}`;
}

function decodeFragment(fragment) {
  if (!fragment) return null;

  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function normalizeHref(href, currentPath) {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (/^(?:mailto|tel|javascript|data|blob):/i.test(trimmed)) return null;

  try {
    const currentUrl = new URL(currentPath, BASE_URL);
    const resolved = new URL(trimmed, currentUrl);

    if (!INTERNAL_ORIGINS.has(resolved.origin)) return null;

    return {
      href: trimmed,
      targetPath: buildTargetKey(resolved),
      anchor: decodeFragment(resolved.hash.slice(1)),
    };
  } catch {
    return null;
  }
}

const fetchCache = new Map();
const crawledPages = new Set();
const queuedTargets = new Set();
const pendingTargets = [];
const linkTargets = new Map();
const anchorTargets = new Map();
const pageAnchors = new Map();

function queueTarget(targetPath) {
  if (queuedTargets.has(targetPath)) return;
  queuedTargets.add(targetPath);
  pendingTargets.push(targetPath);
}

function addRef(map, key, ref) {
  if (!map.has(key)) {
    map.set(key, new Map());
  }

  const refs = map.get(key);
  const refKey = `${ref.source} -> ${ref.href}`;
  refs.set(refKey, ref);
}

async function fetchTarget(targetPath) {
  if (fetchCache.has(targetPath)) {
    return fetchCache.get(targetPath);
  }

  const promise = (async () => {
    const requestUrl = new URL(targetPath, BASE_URL);

    try {
      const res = await fetch(requestUrl, { redirect: 'follow' });
      const finalUrl = new URL(res.url);
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const isSameOrigin = finalUrl.origin === BASE_URL.origin;
      const isCandidateHtml = isSameOrigin && contentType.includes('text/html');
      const html = isCandidateHtml ? await res.text() : '';
      const isNotFound =
        isCandidateHtml &&
        html.includes('<title>404 — Page Not Found | Cadence</title>') &&
        html.includes('This page could not be found.');
      const isHtml = isCandidateHtml && res.ok && !isNotFound;

      return {
        requestedPath: targetPath,
        resolvedPath: isSameOrigin ? buildTargetKey(finalUrl) : null,
        status: isNotFound ? 404 : res.status,
        redirectedOutsideOrigin: !isSameOrigin,
        isNotFound,
        isHtml,
        html,
      };
    } catch {
      return {
        requestedPath: targetPath,
        resolvedPath: null,
        status: 0,
        redirectedOutsideOrigin: false,
        isNotFound: false,
        isHtml: false,
        html: '',
      };
    }
  })();

  fetchCache.set(targetPath, promise);
  return promise;
}

function extractLinks(html) {
  const links = [];
  const re = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let match;

  while ((match = re.exec(html)) !== null) {
    links.push(match[1] ?? match[2]);
  }

  return links;
}

function extractAnchors(html) {
  const anchors = new Set();
  const re = /\b(?:id|name)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;

  while ((match = re.exec(html)) !== null) {
    anchors.add(match[1] ?? match[2]);
  }

  return anchors;
}

async function crawl() {
  let processed = 0;

  while (pendingTargets.length > 0) {
    const batch = pendingTargets.splice(0, 10);
    const results = await Promise.all(batch.map((target) => fetchTarget(target)));

    for (const result of results) {
      processed++;

      if (processed % 20 === 0) {
        process.stderr.write(
          `\r  Checked ${processed} targets, ${crawledPages.size} HTML pages, ${pendingTargets.length} queued...`,
        );
      }

      if (!result.isHtml || !result.resolvedPath) {
        continue;
      }

      if (crawledPages.has(result.resolvedPath)) {
        continue;
      }

      crawledPages.add(result.resolvedPath);
      pageAnchors.set(result.resolvedPath, extractAnchors(result.html));

      for (const href of extractLinks(result.html)) {
        const normalized = normalizeHref(href, result.resolvedPath);
        if (!normalized) continue;

        addRef(linkTargets, normalized.targetPath, {
          source: result.resolvedPath,
          href,
        });

        if (normalized.anchor) {
          addRef(anchorTargets, `${normalized.targetPath}#${normalized.anchor}`, {
            source: result.resolvedPath,
            href,
            anchor: normalized.anchor,
            targetPath: normalized.targetPath,
          });
        }

        queueTarget(normalized.targetPath);
      }
    }
  }

  process.stderr.write(
    `\r  Checked ${processed} targets total, ${crawledPages.size} HTML pages.                    \n`,
  );
}

function formatBrokenStatus(result) {
  if (!result) return 'missing';
  if (result.redirectedOutsideOrigin) return 'redirected outside origin';
  return String(result.status);
}

function formatAnchorFailure(result, anchor) {
  if (!result) return `#${anchor} target could not be fetched`;
  if (result.redirectedOutsideOrigin) return 'redirected outside origin';
  if (result.status !== 200) return `[${result.status}] target page is broken`;
  return `#${anchor} not found`;
}

function uniqueSources(refs) {
  return [...new Set(refs.map((ref) => ref.source))];
}

async function main() {
  console.log(`\n  Link Checker for cadence-lang.org`);
  console.log(`   Base: ${BASE_URL.origin}`);
  console.log(`   Site Origin: ${SITE_URL.origin}`);
  console.log(`   Start: ${START}\n`);

  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch {
    console.error(
      `Cannot reach ${BASE_URL.origin}. Is the dev server running? (npm run dev)`,
    );
    process.exit(1);
  }

  const startTarget = normalizeHref(START, '/');
  if (!startTarget) {
    console.error(`Invalid --start value: ${START}`);
    process.exit(1);
  }

  addRef(linkTargets, startTarget.targetPath, {
    source: '(start)',
    href: START,
  });
  queueTarget(startTarget.targetPath);

  console.log('Crawling pages and collecting links...');
  await crawl();

  console.log(`\nResults:`);
  console.log(`   HTML pages crawled: ${crawledPages.size}`);
  console.log(`   Internal link targets discovered: ${linkTargets.size}`);

  console.log('\nVerifying internal link targets...');
  const brokenPages = [];

  for (const [targetPath, refs] of linkTargets) {
    const result = await fetchTarget(targetPath);
    const isOk = result.status === 200 && !result.redirectedOutsideOrigin;

    if (isOk) continue;

    brokenPages.push({
      targetPath,
      refs: [...refs.values()],
      status: formatBrokenStatus(result),
    });
  }

  console.log('Verifying anchor links...');
  const brokenAnchors = [];

  for (const [, refs] of anchorTargets) {
    const ref = refs.values().next().value;
    const result = await fetchTarget(ref.targetPath);
    const anchorPagePath = result?.resolvedPath || ref.targetPath;

    if (result.status !== 200 || result.redirectedOutsideOrigin || !result.isHtml) {
      brokenAnchors.push({
        href: `${ref.targetPath}#${ref.anchor}`,
        refs: [...refs.values()],
        reason: formatAnchorFailure(result, ref.anchor),
      });
      continue;
    }

    const ids = pageAnchors.get(anchorPagePath) || extractAnchors(result.html);
    pageAnchors.set(anchorPagePath, ids);

    if (!ids.has(ref.anchor)) {
      brokenAnchors.push({
        href: `${ref.targetPath}#${ref.anchor}`,
        refs: [...refs.values()],
        reason: `#${ref.anchor} not found`,
      });
    }
  }

  console.log('\n' + '='.repeat(70));

  if (brokenPages.length === 0 && brokenAnchors.length === 0) {
    console.log('All links OK! No broken links found.');
  } else {
    if (brokenPages.length > 0) {
      console.log(`\nBroken page links (${brokenPages.length}):\n`);

      for (const { targetPath, refs, status } of brokenPages) {
        console.log(`  [${status}] ${targetPath}`);
        for (const source of uniqueSources(refs)) {
          console.log(`        <- linked from: ${source}`);
        }
      }
    }

    if (brokenAnchors.length > 0) {
      console.log(`\nBroken anchor links (${brokenAnchors.length}):\n`);

      for (const { href, refs, reason } of brokenAnchors) {
        console.log(`  ${reason} in ${href}`);
        for (const source of uniqueSources(refs)) {
          console.log(`        <- linked from: ${source}`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  const totalBroken = brokenPages.length + brokenAnchors.length;
  console.log(
    `Summary: ${crawledPages.size} HTML pages, ${linkTargets.size} internal targets, ${totalBroken} broken links\n`,
  );

  process.exit(totalBroken > 0 ? 1 : 0);
}

main();

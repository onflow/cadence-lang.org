#!/usr/bin/env node

/**
 * Link checker for cadence-lang.org
 * Crawls the local dev server and reports broken internal links.
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. Run: node scripts/check-links.mjs [--base http://localhost:3000] [--start /docs]
 */

const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:3000';

const START = process.argv.includes('--start')
  ? process.argv[process.argv.indexOf('--start') + 1]
  : '/docs';

const visited = new Set();
const queue = [START];
const broken = [];
const anchorsToCheck = [];
const pageAnchors = new Map();

async function fetchPage(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return { status: res.status, html: res.ok ? await res.text() : '' };
  } catch {
    return { status: 0, html: '' };
  }
}

function extractLinks(html) {
  const links = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    links.push(m[1]);
  }
  return links;
}

function extractIds(html) {
  const ids = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

function isInternal(href) {
  return href.startsWith('/') || href.startsWith('#');
}

function normalizePath(href) {
  const [path, anchor] = href.split('#');
  return { path: path || null, anchor: anchor || null };
}

async function crawl() {
  let processed = 0;

  while (queue.length > 0) {
    const batch = [];
    while (queue.length > 0 && batch.length < 10) {
      const path = queue.shift();
      if (visited.has(path)) continue;
      visited.add(path);
      batch.push(path);
    }

    const results = await Promise.all(batch.map(async (path) => {
      const { status, html } = await fetchPage(path);
      processed++;
      if (processed % 20 === 0) {
        process.stderr.write(`\r  Checked ${processed} pages, ${queue.length} queued, ${broken.length} broken...`);
      }
      if (status !== 200) return { path, status, links: [] };
      pageAnchors.set(path, extractIds(html));
      return { path, status, links: extractLinks(html) };
    }));

    for (const { path, status, links } of results) {
      if (status !== 200) continue;

      for (const href of links) {
        if (!isInternal(href)) continue;
        const { path: linkPath, anchor } = normalizePath(href);

        if (!linkPath || linkPath === '') {
          if (anchor) {
            anchorsToCheck.push({ source: path, href, anchor, targetPath: path });
          }
          continue;
        }

        if (!linkPath.startsWith('/docs')) continue;
        if (/\.\w{2,4}$/.test(linkPath)) continue;

        if (!visited.has(linkPath)) {
          queue.push(linkPath);
        }

        if (anchor) {
          anchorsToCheck.push({ source: path, href, anchor, targetPath: linkPath });
        }
      }
    }
  }

  process.stderr.write(`\r  Checked ${processed} pages total.                    \n`);
}

async function main() {
  console.log(`\n  Link Checker for cadence-lang.org`);
  console.log(`   Base: ${BASE}`);
  console.log(`   Start: ${START}\n`);

  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch {
    console.error(`Cannot reach ${BASE}. Is the dev server running? (npm run dev)`);
    process.exit(1);
  }

  console.log('Crawling pages and collecting links...');
  await crawl();

  console.log(`\nResults:`);
  console.log(`   Pages crawled: ${visited.size}`);

  // Verify all link targets
  console.log('\nVerifying all internal link targets...');
  const linkTargets = new Map();

  for (const path of visited) {
    const { status, html } = await fetchPage(path);
    if (status !== 200) continue;

    for (const href of extractLinks(html)) {
      if (!isInternal(href)) continue;
      const { path: linkPath } = normalizePath(href);
      if (!linkPath || !linkPath.startsWith('/docs')) continue;
      if (/\.\w{2,4}$/.test(linkPath)) continue;

      if (!linkTargets.has(linkPath)) linkTargets.set(linkPath, []);
      linkTargets.get(linkPath).push({ source: path, href });
    }
  }

  const targetPaths = [...linkTargets.keys()];
  for (let i = 0; i < targetPaths.length; i += 10) {
    const batch = targetPaths.slice(i, i + 10);
    const results = await Promise.all(batch.map(async (target) => {
      if (visited.has(target) && pageAnchors.has(target)) {
        return { target, status: 200 };
      }
      const { status } = await fetchPage(target);
      return { target, status };
    }));

    for (const { target, status } of results) {
      if (status !== 200) {
        for (const { source } of linkTargets.get(target)) {
          broken.push({ source, href: target, status });
        }
      }
    }
  }

  // Check anchors
  console.log('Verifying anchor links...');
  const brokenAnchors = [];

  for (const { source, anchor, targetPath } of anchorsToCheck) {
    if (!targetPath.startsWith('/docs')) continue;

    let ids = pageAnchors.get(targetPath);
    if (!ids) {
      const { status, html } = await fetchPage(targetPath);
      if (status === 200) {
        ids = extractIds(html);
        pageAnchors.set(targetPath, ids);
      } else {
        continue;
      }
    }

    if (!ids.has(anchor)) {
      brokenAnchors.push({ source, href: `${targetPath}#${anchor}`, anchor });
    }
  }

  // Report
  console.log('\n' + '='.repeat(70));

  if (broken.length === 0 && brokenAnchors.length === 0) {
    console.log('All links OK! No broken links found.');
  } else {
    if (broken.length > 0) {
      console.log(`\nBroken page links (${broken.length}):\n`);
      const seen = new Set();
      for (const { source, href, status } of broken) {
        const key = `${source} -> ${href}`;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  [${status}] ${href}`);
        console.log(`        <- linked from: ${source}`);
      }
    }

    if (brokenAnchors.length > 0) {
      console.log(`\nBroken anchor links (${brokenAnchors.length}):\n`);
      const seen = new Set();
      for (const { source, href, anchor } of brokenAnchors) {
        const key = `${source} -> ${href}`;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  #${anchor} not found in ${href}`);
        console.log(`        <- linked from: ${source}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  const totalBroken = broken.length + brokenAnchors.length;
  console.log(`Summary: ${visited.size} pages, ${totalBroken} broken links\n`);

  process.exit(totalBroken > 0 ? 1 : 0);
}

main();

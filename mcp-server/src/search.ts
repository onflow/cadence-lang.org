import { readdir, readFile, access } from 'node:fs/promises';
import { join, extname, basename, dirname, relative } from 'node:path';
import { create, insert, search } from '@orama/orama';

interface DocSource {
  dir: string;
  pathPrefix: string;
}

const DEFAULT_DOCS_DIR =
  process.env.DOCS_DIR || join(import.meta.dirname, '..', '..', 'content', 'docs');

const EXTERNAL_DOCS_DIR = join(import.meta.dirname, '..', '..', 'external', 'onflow-docs', 'docs');

async function dirExists(dir: string): Promise<boolean> {
  try {
    await access(dir);
    return true;
  } catch {
    return false;
  }
}

async function getDocSources(): Promise<DocSource[]> {
  const sources: DocSource[] = [];

  if (await dirExists(DEFAULT_DOCS_DIR)) {
    sources.push({ dir: DEFAULT_DOCS_DIR, pathPrefix: '/docs' });
  }

  if (await dirExists(EXTERNAL_DOCS_DIR)) {
    sources.push({ dir: EXTERNAL_DOCS_DIR, pathPrefix: '/flow-docs' });
  }

  const extraDir = process.env.EXTRA_DOCS_DIR;
  if (extraDir && (await dirExists(extraDir))) {
    const extraPrefix = process.env.EXTRA_DOCS_PREFIX || '/extra-docs';
    sources.push({ dir: extraDir, pathPrefix: extraPrefix });
  }

  return sources;
}

let _docsAvailable: boolean | null = null;

export async function docsAvailable(): Promise<boolean> {
  if (_docsAvailable !== null) return _docsAvailable;
  const sources = await getDocSources();
  _docsAvailable = sources.length > 0;
  return _docsAvailable;
}

interface DocEntry {
  path: string;
  title: string;
  description: string;
  content: string;
}

const db = await create({
  schema: {
    path: 'string' as const,
    title: 'string' as const,
    description: 'string' as const,
    content: 'string' as const,
  },
});

let indexBuilt = false;
const docsByPath = new Map<string, DocEntry>();

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractFrontmatter(content: string): { title: string; description: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { title: '', description: '' };
  const fm = match[1];
  const title = fm.match(/^title:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '') || '';
  const description = fm.match(/^description:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '') || '';
  return { title, description };
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

async function indexSource(source: DocSource): Promise<DocEntry[]> {
  const files = await walk(source.dir);
  const entries: DocEntry[] = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { title, description } = extractFrontmatter(raw);
    const content = stripFrontmatter(raw);
    const rel = file.replace(source.dir, '').replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/[^/]+$/, '');
    const docPath = name === 'index' ? `${source.pathPrefix}${dir}` : `${source.pathPrefix}${dir}/${name}`;

    const doc: DocEntry = { path: docPath, title, description, content };
    entries.push(doc);
    docsByPath.set(docPath, doc);
    await insert(db, doc);
  }

  return entries;
}

export async function buildIndex(): Promise<DocEntry[]> {
  if (indexBuilt) {
    const all = await search(db, { term: '', limit: 100000 });
    return all.hits.map((h) => h.document as DocEntry);
  }

  const sources = await getDocSources();
  const allEntries: DocEntry[] = [];

  for (const source of sources) {
    const entries = await indexSource(source);
    allEntries.push(...entries);
  }

  indexBuilt = true;
  return allEntries;
}

export async function searchDocs(query: string, topN = 5): Promise<DocEntry[]> {
  await buildIndex();

  const results = await search(db, {
    term: query,
    limit: topN,
    tolerance: 1,
    boost: { title: 3, description: 2 },
  });

  return results.hits.map((h) => h.document as DocEntry);
}

export async function getDoc(path: string): Promise<DocEntry | null> {
  await buildIndex();
  return docsByPath.get(path) ?? null;
}

// --- Tree browsing ---

export interface DocTreeNode {
  path: string;
  title: string;
  description: string;
  children?: { path: string; title: string; description: string }[];
  sections?: { heading: string; level: number }[];
}

export function extractHeadings(content: string): { heading: string; level: number }[] {
  const headings: { heading: string; level: number }[] = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (m) {
      headings.push({ heading: m[2].trim(), level: m[1].length });
    }
  }
  return headings;
}

let treeCache: Map<string, DocTreeNode> | null = null;

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function buildTreeForSource(source: DocSource): Promise<Map<string, DocTreeNode>> {
  const nodes = new Map<string, DocTreeNode>();
  const files = await walk(source.dir);

  // Build nodes for each file
  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { title, description } = extractFrontmatter(raw);
    const content = stripFrontmatter(raw);
    const rel = file.replace(source.dir, '').replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/[^/]+$/, '');
    const docPath = name === 'index' ? `${source.pathPrefix}${dir}` : `${source.pathPrefix}${dir}/${name}`;

    nodes.set(docPath, {
      path: docPath,
      title: title || name,
      description: description || '',
      sections: extractHeadings(content),
    });
  }

  // Build directory nodes by scanning for children
  // Collect all unique parent paths
  const parentPaths = new Set<string>();
  for (const docPath of nodes.keys()) {
    let parent = docPath.substring(0, docPath.lastIndexOf('/'));
    while (parent && parent.length >= source.pathPrefix.length) {
      parentPaths.add(parent);
      parent = parent.substring(0, parent.lastIndexOf('/'));
    }
  }

  // For each parent, find direct children and set them
  for (const parentPath of parentPaths) {
    const existing = nodes.get(parentPath);
    const children: { path: string; title: string; description: string }[] = [];

    for (const [childPath, childNode] of nodes) {
      if (childPath === parentPath) continue;
      // Direct child: parent is the path up to the last slash
      const childParent = childPath.substring(0, childPath.lastIndexOf('/'));
      if (childParent === parentPath) {
        children.push({ path: childPath, title: childNode.title, description: childNode.description });
      }
    }

    // Also add directory children that are only parent paths (not leaf nodes)
    for (const otherParent of parentPaths) {
      if (otherParent === parentPath) continue;
      const otherParentParent = otherParent.substring(0, otherParent.lastIndexOf('/'));
      if (otherParentParent === parentPath && !nodes.has(otherParent)) {
        // This is a directory without an index file - get its label
        const relDir = otherParent.replace(source.pathPrefix, '');
        const absDir = join(source.dir, relDir);
        let label = basename(otherParent);

        // Try to read category label from _category_.json (Flow docs)
        const catJson = await readJsonFile(join(absDir, '_category_.json')) as { label?: string } | null;
        if (catJson?.label) label = catJson.label;

        children.push({ path: otherParent, title: label, description: '' });
      }
    }

    // Try to order children using meta.json (Cadence docs)
    const relDir = parentPath.replace(source.pathPrefix, '');
    const absDir = join(source.dir, relDir);
    const metaJson = await readJsonFile(join(absDir, 'meta.json')) as { pages?: string[] } | null;
    if (metaJson?.pages) {
      const order = metaJson.pages.filter((p: string) => p !== '...');
      children.sort((a, b) => {
        const aName = basename(a.path);
        const bName = basename(b.path);
        const aIdx = order.indexOf(aName);
        const bIdx = order.indexOf(bName);
        if (aIdx === -1 && bIdx === -1) return a.title.localeCompare(b.title);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    } else {
      children.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (existing) {
      existing.children = children;
    } else {
      // Directory node without an index file
      let label = basename(parentPath);
      const catJson = await readJsonFile(join(absDir, '_category_.json')) as { label?: string } | null;
      if (catJson?.label) label = catJson.label;

      nodes.set(parentPath, {
        path: parentPath,
        title: label,
        description: '',
        children,
      });
    }
  }

  return nodes;
}

export async function buildTree(): Promise<Map<string, DocTreeNode>> {
  if (treeCache) return treeCache;

  const sources = await getDocSources();
  const allNodes = new Map<string, DocTreeNode>();

  for (const source of sources) {
    const sourceNodes = await buildTreeForSource(source);
    for (const [path, node] of sourceNodes) {
      allNodes.set(path, node);
    }
  }

  // Build root node
  const rootChildren: { path: string; title: string; description: string }[] = [];
  for (const source of sources) {
    const node = allNodes.get(source.pathPrefix);
    if (node) {
      rootChildren.push({ path: node.path, title: node.title, description: node.description });
    } else {
      // Source root has no index file, create a synthetic entry
      const label = source.pathPrefix === '/docs' ? 'Cadence Documentation'
        : source.pathPrefix === '/flow-docs' ? 'Flow Documentation'
        : source.pathPrefix.replace(/^\//, '');
      rootChildren.push({ path: source.pathPrefix, title: label, description: '' });
    }
  }

  allNodes.set('/', {
    path: '/',
    title: 'Documentation',
    description: 'Root of all documentation',
    children: rootChildren,
  });

  treeCache = allNodes;
  return allNodes;
}

export async function browseDoc(path?: string): Promise<DocTreeNode | null> {
  const tree = await buildTree();
  const normalized = path || '/';
  return tree.get(normalized) ?? null;
}

/** Reset tree cache (for testing) */
export function resetTreeCache(): void {
  treeCache = null;
}

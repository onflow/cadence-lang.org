import { describe, it, expect } from 'bun:test';
import { extractHeadings, buildTree, browseDoc, resetTreeCache } from './search.js';

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings', () => {
    const content = `# Title
Some text
## Overview
More text
### Sub-section
Even more
## Another Section
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { heading: 'Overview', level: 2 },
      { heading: 'Sub-section', level: 3 },
      { heading: 'Another Section', level: 2 },
    ]);
  });

  it('ignores h1 and h4+', () => {
    const content = `# H1
## H2
### H3
#### H4
`;
    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { heading: 'H2', level: 2 },
      { heading: 'H3', level: 3 },
    ]);
  });

  it('returns empty for content without headings', () => {
    expect(extractHeadings('Just some text')).toEqual([]);
  });
});

describe('buildTree', () => {
  it('produces a tree with nodes', async () => {
    resetTreeCache();
    const tree = await buildTree();
    expect(tree.size).toBeGreaterThan(0);
  });

  it('root node has children', async () => {
    const tree = await buildTree();
    const root = tree.get('/');
    expect(root).toBeDefined();
    expect(root!.children).toBeDefined();
    expect(root!.children!.length).toBeGreaterThan(0);
  });

  it('root includes /docs source', async () => {
    const tree = await buildTree();
    const root = tree.get('/');
    const hasDocs = root!.children!.some((c) => c.path === '/docs');
    expect(hasDocs).toBe(true);
  });
});

describe('browseDoc', () => {
  it('returns root when called with no path', async () => {
    const node = await browseDoc();
    expect(node).toBeDefined();
    expect(node!.path).toBe('/');
    expect(node!.children!.length).toBeGreaterThan(0);
  });

  it('returns root when called with "/"', async () => {
    const node = await browseDoc('/');
    expect(node).toBeDefined();
    expect(node!.path).toBe('/');
  });

  it('returns /docs node with children', async () => {
    const node = await browseDoc('/docs');
    expect(node).toBeDefined();
    expect(node!.path).toBe('/docs');
    expect(node!.children).toBeDefined();
    expect(node!.children!.length).toBeGreaterThan(0);
  });

  it('/docs/language has child pages', async () => {
    const node = await browseDoc('/docs/language');
    expect(node).toBeDefined();
    expect(node!.children).toBeDefined();
    expect(node!.children!.length).toBeGreaterThan(0);
    // Should include known pages like resources
    const hasResources = node!.children!.some((c) => c.path.includes('resources'));
    expect(hasResources).toBe(true);
  });

  it('leaf nodes have sections', async () => {
    const node = await browseDoc('/docs/language/resources');
    expect(node).toBeDefined();
    expect(node!.sections).toBeDefined();
    expect(node!.sections!.length).toBeGreaterThan(0);
  });

  it('returns null for nonexistent path', async () => {
    const node = await browseDoc('/nonexistent/path');
    expect(node).toBeNull();
  });
});

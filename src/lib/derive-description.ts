/**
 * Extracts the first substantive prose paragraph from processed (JSX-stripped)
 * markdown. Used to auto-generate meta descriptions and llms.txt annotations
 * for pages that lack a frontmatter `description` field.
 */
export function deriveDescription(processedMarkdown: string): string {
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
    // Skip processed-MDX heading text + anchor like "Introduction [#introduction]"
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

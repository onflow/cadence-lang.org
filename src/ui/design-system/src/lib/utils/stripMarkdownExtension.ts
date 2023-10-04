export const stripMarkdownExtension = (href: string) => {
  if (!/^https?:\/\//.test(href)) {
    return href?.replace(/(.mdx?)/, "")
  }
  return href
}

export function isLinkExternal(url: string) {
  return /^(https?:\/\/|www\.)/.test(url) || /^(mailto:)/.test(url)
}

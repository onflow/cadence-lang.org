import { useMemo } from "react"
import { isLinkExternal } from "./isLinkExternal"
import { stripLeadingSlashes } from "./stripLeadingSlashes"
import { stripTrailingSlashes } from "./stripTrailingSlashes"

// This is used so we have a valid base URL (which requires and origin),
// but we strip it out anyway so the actual host name and scheme don't really
// matter
const PLACEHOLDER_ORIGIN = "https://placeholder"

export interface UseResolvedUrlOptions {
  stripTrailingSlash?: boolean
  searchParams?: Record<string, string>
}

export const resolveUrl = (
  href: string,
  basePath: string = "",
  options?: UseResolvedUrlOptions
) => {
  const url = new URL(
    href,
    `${PLACEHOLDER_ORIGIN}/${stripLeadingSlashes(basePath)}`
  )

  if (options?.searchParams) {
    Object.entries(options?.searchParams).forEach(([name, value]) => {
      url.searchParams.set(name, value)
    })
  }

  const resolved = url.toString().substring(url.origin.length)

  return options?.stripTrailingSlash ? stripTrailingSlashes(resolved) : resolved
}

/**
 * Resolves a relative URL using the given base path. If the href provided
 * is external, the original href is returned, unmodified.
 */
export const useResolvedUrl = (
  href: string,
  basePath: string = "",
  options?: UseResolvedUrlOptions
) =>
  useMemo(() => {
    if (isLinkExternal(href)) {
      return href
    }

    return resolveUrl(href, basePath, options)
  }, [basePath, href, options])

import { createContext, useContext } from "react"
import { stripLeadingSlashes } from "../utils/stripLeadingSlashes"
import { useResolvedUrl } from "../utils/useResolvedUrl"

export type InternalUrlContextValue = {
  basePath?: string
  searchParams?: Record<string, string>
}

/**
 * Tracks the "base URL" to use for relative links found in "internal" content.
 */
export const InternalUrlContext = createContext<InternalUrlContextValue>({})

/**
 * Resolves any relative internal URL to use the correct base path.
 */
export const useInternalUrl = (href: string) => {
  const { basePath, searchParams } = useContext(InternalUrlContext)
  return useResolvedUrl(href, basePath, { searchParams })
}

/**
 * Resolves any relative asset URL by prepending the assets path.
 */
export const useInternalAssetUrl = (href: string) => {
  const { basePath = "", searchParams } = useContext(InternalUrlContext)
  const assetsBasePath = "/assets/" + stripLeadingSlashes(basePath)
  return useResolvedUrl(href, assetsBasePath, { searchParams })
}

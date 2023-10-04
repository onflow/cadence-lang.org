import { useMemo } from "react"

export type UseInternalBreadcrumbsOptions = {
  /**
   * The currently active item taken from the sidebar configuration object.
   */
  activeItem?: {
    href: string
    title: string
  }

  /**
   * An array of additional possible breadcrumnbs. If any match the
   * `activeItem` they will be included.
   */
  additionalitems?: Array<{
    href: string
    title: string
  }>

  /**
   * THe name to display in the breadcrumbs for the current collection
   */
  collectionDisplayName: string

  /**
   * The root path for the current collection
   */
  collectionRootPath: string
}

/**
 * Returns a list of breadcrumbs to display based on the current `activeItem`
 * and doc collection.
 */
export const useInternalBreadcrumbs = ({
  activeItem,
  additionalitems,
  collectionDisplayName,
  collectionRootPath,
}: UseInternalBreadcrumbsOptions) =>
  useMemo(() => {
    const breadcrumbs = [
      { href: "/", title: "Home" },
      { href: collectionRootPath, title: collectionDisplayName },
    ]

    // Add any additional items that match the active item.
    additionalitems?.forEach((item) => {
      if (activeItem?.href?.startsWith(item.href)) {
        breadcrumbs.push(item)
      }
    })

    // Make sure items are sorted from least-specific to most-specific
    breadcrumbs.sort((a, b) => a.href.length - b.href.length)

    if (activeItem) {
      breadcrumbs.push(activeItem)
    }

    return breadcrumbs
  }, [activeItem, additionalitems, collectionDisplayName, collectionRootPath])

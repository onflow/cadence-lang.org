import { capitalCase } from "change-case"

/**
 * Generates a title from a URL by taking the last segments of the URL
 * path and converting it's case to "capital case"
 */
export const titleFromHref = (href: string) =>
  capitalCase(
    href
      .split("/")
      .filter((segment) => !!segment) // Remove empty segments
      .at(-1) || ""
  )

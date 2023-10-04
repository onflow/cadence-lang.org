import clsx from "clsx"
import { forwardRef } from "react"
import { useInternalAssetUrl } from "../InternalUrlContext"

export type InternalImgProps = React.ComponentPropsWithRef<"img">

/**
 * Renders an <img> tag for "internal" content, resolving any underlying
 * relative `src` URL the appropriate path (prepending the current
 * base collection URL + asset path)
 */
export const InternalImg = forwardRef<HTMLImageElement, InternalImgProps>(
  ({ className, src, ...props }, ref) => {
    const resolvedSrc = useInternalAssetUrl(src || "")

    return (
      <img
        ref={ref}
        className={clsx("not-prose", className)}
        src={src !== undefined ? resolvedSrc : undefined}
        {...props}
      />
    )
  }
)

InternalImg.displayName = "InternalImg"

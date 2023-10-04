import * as React from "react"
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect"

let serverHandoffComplete = false
let id = 0
function genId() {
  return ++id
}

/**
 * Autogenerate stable IDs across re-renders
 *
 * Taken from this Reach UI implementation:
 * https://github.com/reach/reach-ui/blob/dev/packages/auto-id/src/auto-id.ts
 *
 * This should be removed when we upgrade to React 18 in favor of the new
 * built-in `useId` hook!
 */
function useId(providedId?: number | string | undefined | null) {
  // @ts-expect-error
  if (typeof React.useId === "function") {
    console.warn(
      "Please remove the custom `useId` implementation and switch to the built-in React version!"
    )
  }

  // If this instance isn't part of the initial render, we don't have to do the
  // double render/patch-up dance. We can just generate the ID and return it.
  const initialId = providedId ?? (serverHandoffComplete ? genId() : null)
  const [id, setId] = React.useState(initialId)

  useIsomorphicLayoutEffect(() => {
    if (id === null) {
      // Patch the ID after render. We do this in `useLayoutEffect` to avoid any
      // rendering flicker, though it'll make the first render slower (unlikely
      // to matter, but you're welcome to measure your app and let us know if
      // it's a problem).
      setId(genId())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (serverHandoffComplete === false) {
      // Flag all future uses of `useId` to skip the update dance. This is in
      // `useEffect` because it goes after `useLayoutEffect`, ensuring we don't
      // accidentally bail out of the patch-up dance prematurely.
      serverHandoffComplete = true
    }
  }, [])

  return providedId ?? id ?? undefined
}

export { useId }

import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect"

export type UseResizeObserverCallback = (target?: ResizeObserverEntry) => void

class SharedResizeObserver {
  callbacks = new WeakMap<Element, UseResizeObserverCallback>()
  sharedResizeObserver?: ResizeObserver

  constructor() {
    if (typeof window !== "undefined" && window.ResizeObserver) {
      this.sharedResizeObserver = new ResizeObserver(
        this.updateResizedElements.bind(this)
      )
    }
  }

  updateResizedElements(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const callbackForElement = this.callbacks.get(entry.target)
      if (callbackForElement) callbackForElement(entry)
    }
  }

  observe(element: Element, callback: UseResizeObserverCallback) {
    if (!this.sharedResizeObserver) return
    this.sharedResizeObserver.observe(element)
    this.callbacks.set(element, callback)
  }

  unobserve(element: Element) {
    if (!this.sharedResizeObserver) return
    this.sharedResizeObserver.unobserve(element)
    this.callbacks.delete(element)
  }
}

/**
 * It is recommended to only have a single ResizeObserver for performance
 * reasons.
 * @see {@link https://github.com/WICG/resize-observer/issues/59#issuecomment-408098151}
 */
const resizeObserverSingleton = new SharedResizeObserver()

/**
 * A hook that observers an element and calls a function when it is resized.
 *
 * @param ref A ref to the element to be observerd
 * @param callback A callback that will be called when the element is resized.
 *   This should be memoized!
 */
export const useResizeObserver = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: UseResizeObserverCallback
) => {
  useIsomorphicLayoutEffect(() => {
    const { current } = ref

    if (!current) {
      return
    }

    resizeObserverSingleton.observe(current, callback)

    return () => {
      resizeObserverSingleton.unobserve(current)
    }
  }, [ref, callback])
}

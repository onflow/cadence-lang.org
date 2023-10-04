import clsx from "clsx"
import React, { useCallback, useRef, useState } from "react"

export type CarouselProps = React.PropsWithChildren<{
  /**
   * The breakpoint at which the view should switch to non-carousel mode.
   * If none, then carousel mode will always be used.
   */
  breakpoint?: "none" | "sm" | "md" | "lg" | "xl"

  /**
   * The width of each item within the carousel
   * (this could be anything, but they must be explicit so that tailwind's
   * PurgeCSS doesn't remove the class from the final CSS)
   */
  carouselItemWidth?:
    | "w-6/12"
    | "w-8/12"
    | "w-9/12"
    | "w-10/12"
    | "w-11/12"
    | "w-full"
    | string

  className?: string

  indicatorColor?: string
  indicatorSelectedColor?: string
  indicatorSize?: "xs" | "sm" | "md"
}>

/**
 * A Carousel that allows scrolling through it's children horizontally and
 * individually, but in larger screens (md+) shows all children stacked
 * vertically.
 */
export function Carousel({
  breakpoint = "md",
  carouselItemWidth = "w-10/12",
  children,
  className,
  indicatorColor = "bg-primary-gray-100",
  indicatorSelectedColor = "bg-green-success",
  indicatorSize = "md",
}: CarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollContainer = useRef<HTMLUListElement>(null)
  const childCount = React.Children.count(children)

  const onScrollHandler = useCallback<React.UIEventHandler<HTMLUListElement>>(
    (e) => {
      const { scrollWidth, scrollLeft } = e.currentTarget
      const index = Math.round((scrollLeft / scrollWidth) * childCount)
      setSelectedIndex(index)
    },
    [childCount]
  )

  return (
    <section className={clsx("flex flex-col", className)}>
      <ul
        className={clsx(
          "flex min-h-fit flex-1 snap-x snap-mandatory list-none flex-row gap-6 overflow-x-auto scrollbar-hide",
          {
            "sm:flex-col": breakpoint === "sm",
            "md:flex-col": breakpoint === "md",
            "lg:flex-col": breakpoint === "lg",
            "xl:flex-col": breakpoint === "xl",
          }
        )}
        onScroll={onScrollHandler}
        ref={scrollContainer}
      >
        {React.Children.map(children, (child, index) => (
          <li
            key={index}
            className={clsx("flex-none snap-start", {
              [carouselItemWidth]: childCount > 1,
              "w-full ": childCount <= 1,
              "sm:w-full": breakpoint === "sm",
              "md:w-full": breakpoint === "md",
              "lg:w-full": breakpoint === "lg",
              "xl:w-full": breakpoint === "xl",
            })}
          >
            {child}
          </li>
        ))}
      </ul>
      <div
        className={clsx("flex list-none flex-row justify-center pt-3", {
          hidden: childCount <= 1,
          "sm:hidden": breakpoint === "sm",
          "md:hidden": breakpoint === "md",
          "lg:hidden": breakpoint === "lg",
          "xl:hidden": breakpoint === "xl",
        })}
        role="listbox"
      >
        {React.Children.map(children, (_, index) => (
          <button
            key={index}
            type="button"
            role="option"
            aria-selected={index === selectedIndex ? "true" : "false"}
            className={clsx("mr-3 rounded-full hover:cursor-pointer", {
              [indicatorSelectedColor]: index === selectedIndex,
              [indicatorColor]: index !== selectedIndex,
              "h-2 w-2": indicatorSize === "xs",
              "h-3 w-3": indicatorSize === "sm",
              "h-4 w-4": indicatorSize === "md",
            })}
            onClick={(e) => {
              const { current } = scrollContainer

              current?.scrollTo({
                left: current?.scrollWidth * (index / childCount),
                behavior: "smooth",
              })
            }}
          />
        ))}
      </div>
    </section>
  )
}

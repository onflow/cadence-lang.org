import React, { useEffect, useRef, useState } from "react"
import TutorialCard, { TutorialCardProps } from "."
import { useIsomorphicLayoutEffect } from "../../utils/useIsomorphicLayoutEffect"
import Pagination from "../Pagination"

export type PaginatedTutorialCardListProps = {
  className?: string

  /**
   * An optional identifier that, when changed, causes the pagination to
   * be reset to the first page.
   */
  listId?: unknown

  pageSize?: number

  tutorials: TutorialCardProps[]

  scrollOnPaginate?: boolean
}

export const PaginatedTutorialCardList = ({
  className,
  listId,
  pageSize = 4,
  tutorials,
  scrollOnPaginate = true,
}: PaginatedTutorialCardListProps) => {
  const scrollRef = useRef<HTMLAnchorElement>(null)
  const [page, setPage] = useState(1)

  // Whenever the page changes we want to scroll to the top of the list -- but
  // only if the page change was triggered by the pagination component. So by
  // incrementing this value any time the page is triggered there, we can
  // trigger the scroll-to-top behavior only in those cases.
  const [resetScroll, setResetScroll] = useState(0)

  useEffect(() => {
    // If the listId changes we reset to the first page.
    // This allows the consuming component to force the page to reset
    // when the list of tutorials is changed in some significant way (i.e. the
    // list was filtered)
    setPage(1)
  }, [listId])

  useIsomorphicLayoutEffect(() => {
    if (!scrollRef.current || resetScroll === 0 || !scrollOnPaginate) {
      return
    }

    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [resetScroll, scrollOnPaginate])

  return (
    <div className={className}>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        {tutorials
          .slice((page - 1) * pageSize, page * pageSize)
          .map((tutorialProps, index) => (
            <TutorialCard
              key={index}
              {...tutorialProps}
              ref={index === 0 ? scrollRef : undefined}
            />
          ))}
      </div>
      <Pagination
        className="mt-4"
        itemCount={tutorials.length}
        page={page}
        pageSize={pageSize}
        setPage={(nextPage) => {
          if (page !== nextPage) {
            setResetScroll(resetScroll + 1)
            setPage(nextPage)
          }
        }}
      />
    </div>
  )
}

export default TutorialCard

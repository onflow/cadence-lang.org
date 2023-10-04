import React from 'react'
import clsx from "clsx"
import ArrowLeftIcon from "../../../../images/arrows/arrow-left.svg"
import ArrowRightIcon from "../../../../images/arrows/arrow-right.svg"

export type PaginationProps = {
  className?: string
  page: number
  itemCount: number
  pageSize: number
  setPage: (page: number) => void
}

const Pagination = ({
  className,
  itemCount,
  pageSize,
  page,
  setPage,
}: PaginationProps) => {
  const pageCount = Math.ceil(itemCount / pageSize)

  return (
    <div className={clsx("flex items-center justify-end", className)}>
      <button
        type="button"
        className={clsx("py-4 px-2", {
          "cursor-pointer text-primary-gray-300 dark:text-white": page > 1,
          "cursor-not-allowed text-primary-gray-100 dark:text-primary-gray-300":
            page <= 1,
        })}
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        <ArrowLeftIcon />
      </button>
      <input
        type="text"
        className="ml-4 mr-2 w-10 rounded-sm border border-primary-gray-300 text-center dark:bg-black dark:text-white"
        value={page}
        onChange={(e) => {
          const value = +e.target.value

          if (!Number.isFinite(value) || value < 1 || value > pageCount) {
            return
          }

          setPage(value)
        }}
      />
      of {pageCount}
      <button
        type="button"
        className={clsx("ml-4 py-4 px-2", {
          "cursor-pointer text-primary-gray-300 hover:text-primary-gray-400 dark:text-white dark:hover:text-primary-gray-50":
            page < pageCount,
          "cursor-not-allowed text-primary-gray-100 dark:text-primary-gray-300":
            page >= pageCount,
        })}
        disabled={page >= pageCount}
        onClick={() => setPage(page + 1)}
      >
        <ArrowRightIcon />
      </button>
    </div>
  )
}

export default Pagination

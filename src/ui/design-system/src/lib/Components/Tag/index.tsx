import React from 'react'
import clsx from "clsx"

export type TagProps = {
  name: string
  className?: string
}

const Tag = ({ name, className }: TagProps) => (
  <span
    className={clsx(
      "mr-2 rounded bg-primary-gray-50 px-1 py-1 font-mono text-xs text-primary-blue dark:bg-black dark:text-blue-dark",
      className
    )}
  >
    #{name}
  </span>
)

export default Tag

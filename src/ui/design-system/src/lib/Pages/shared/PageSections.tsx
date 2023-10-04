import React from 'react'
import clsx from "clsx"

export default function PageSections({
  className,
  children,
  divided = true,
}: {
  className?: string
  divided?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={clsx("flex flex-col", className, {
        "divide-y divide-primary-gray-100 dark:divide-primary-gray-400":
          divided,
      })}
    >
      {children}
    </div>
  )
}

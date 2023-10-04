import React from 'react'
import clsx from "clsx"

export default function PageSection({
  className,
  children,
  sectionId = "", // used for allowing links to scroll to section if `#{sectionId}` is in url
}: {
  className?: string
  children?: React.ReactNode
  sectionId?: string
}) {
  return (
    <div id={sectionId} className={clsx("py-16", className)}>
      {children}
    </div>
  )
}

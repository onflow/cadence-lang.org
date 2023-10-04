import React from 'react'
import clsx from "clsx"

type GradientName =
  | "community"
  | "concepts"
  | "getting-started"
  | "home"
  | "network"
  | "tools"

export default function PageBackground({
  className,
  gradient,
  children,
}: {
  className?: string
  gradient?: GradientName
  children: React.ReactNode
}) {
  return (
    <div
      className={clsx(
        "bg-primary-gray-50 dark:bg-black",
        gradient ? `page-bg-gradient-${gradient} page-bg-gradient` : "",
        className
      )}
    >
      {children}
    </div>
  )
}

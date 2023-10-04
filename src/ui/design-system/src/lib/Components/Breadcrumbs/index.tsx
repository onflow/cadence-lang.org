import clsx from "clsx"
import { Fragment } from "react"
import AppLink from "../AppLink"

export type BreadcrumbLinkProps = {
  title: string
  href?: string
  isCurrent?: boolean
}

export type BreadcrumbsProps = {
  items: BreadcrumbLinkProps[]
}

function Separator() {
  return (
    <span className="mx-3 font-semibold text-primary-gray-200 dark:text-primary-gray-300">
      /
    </span>
  )
}

function BreadcrumbLink({
  title,
  href,
  isCurrent = false,
}: BreadcrumbLinkProps) {
  const className = clsx(
    isCurrent && "text-primary-gray-400 dark:text-primary-gray-100",
    !isCurrent && "text-primary-gray-300 dark:text-primary-gray-200"
  )

  if (!href) {
    return <span className={className}>{title}</span>
  }

  return (
    <AppLink
      to={href}
      className={clsx(
        className,
        "hover:text-primary-gray-400 dark:hover:text-primary-gray-100"
      )}
    >
      {title}
    </AppLink>
  )
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center text-sm">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <Separator />}
          <BreadcrumbLink {...item} isCurrent={index === items.length - 1} />
        </Fragment>
      ))}
    </div>
  )
}

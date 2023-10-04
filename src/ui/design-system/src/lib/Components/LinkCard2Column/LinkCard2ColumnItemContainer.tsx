import React from 'react'
import clsx from 'clsx'
import ExternalLinkIcon from '../../../../images/content/external-link.svg'
import AppLink from '../AppLink'
import { isLinkExternal } from '../../utils/isLinkExternal'

export type LinkCard2ColumnItemContainerProps = React.PropsWithChildren<{
  href?: string
  homePage?: boolean
}>

export function LinkCard2ColumnItemContainer ({
  href,
  homePage,
  children,
}: LinkCard2ColumnItemContainerProps) {
  const className = clsx(
    'group my-2 flex flex-1 flex-col md:flex-col justify-start rounded-lg bg-white-10 px-6 py-5 relative dark:hover:shadow-2xl-dark hover:shadow-2xl',
    homePage ? 'dark:bg-primary-gray-400' : 'dark:bg-black'
  )

  if (href) {
    const isExternal = isLinkExternal(href)

    return (
      <AppLink
        className={clsx(
          className,
          'cursor-pointer  hover:shadow-2xl',
          homePage
            ? 'dark:hover:shadow-2xl-dark-soft'
            : 'dark:bg-black dark:hover:shadow-2xl-dark'
        )}
        to={href}
      >
        {isExternal && (
          <span className="absolute right-4">
            <ExternalLinkIcon />
          </span>
        )}
        {children}
      </AppLink>
    )
  }

  return <div className={className}>{children}</div>
}

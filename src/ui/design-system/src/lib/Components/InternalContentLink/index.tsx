import React from 'react'
import clsx from 'clsx'
import AppLink from '../AppLink'
import { useInternalUrl } from '../InternalUrlContext'
import { isLinkExternal } from '../../utils/isLinkExternal'
import ExternalLinkIcon from './ExternalLinkIcon'

const defaultClasses =
  'leading-[1.1] relative not-prose text-primary-blue dark:text-blue-dark hover:opacity-75 dark:border-blue-dark dark:stroke-blue-dark'

export type LinkProps = React.DetailedHTMLProps<
React.HTMLAttributes<HTMLAnchorElement> & {
  href: string
  'data-footnote-ref'?: boolean
},
HTMLAnchorElement
>

export function InternalContentLink ({
  children,
  className,
  id,
  href,
  ...props
}: LinkProps) {
  const resolvedHref = useInternalUrl(href)
  const isFootnote = !!props['data-footnote-ref']

  if (isLinkExternal(href)) {
    return (
      <AppLink
        to={href}
        className={clsx(defaultClasses, className, {
          'inline stroke-primary-blue': !isFootnote,
          'ml-0.5': isFootnote,
        })}
      >
        <span className="pr-px">{children}</span>
        <ExternalLinkIcon className="inline" />
      </AppLink>
    )
  }

  return (
    <AppLink to={resolvedHref} className={clsx('mr-1', className)}>
      {isFootnote ? <>[{children}]</> : children}
    </AppLink>
  )
}

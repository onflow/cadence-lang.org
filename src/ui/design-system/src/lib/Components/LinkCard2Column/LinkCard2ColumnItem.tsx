import React from 'react'
import ChevronRight from '../../../../images/arrows/chevron-right.svg'
import ExternalLinkIcon from '../../../../images/content/external-link.svg'
import AppLink from '../AppLink'
import { isLinkExternal } from '../../utils/isLinkExternal'
import { LinkCard2ColumnItemContainer } from './LinkCard2ColumnItemContainer'
import { type LinkCardIconType, LINK_CARD_ICONS } from './icons'

export interface LinkCard2ColumnItemBaseProps {
  description: string
  iconType?: LinkCardIconType
  iconAltText?: string
  title: string
  homePage?: boolean
}

export interface LinkCard2ColumnItemSingleLinkProps {
  href: string
  links?: never
}

export interface LinkCard2ColumnItemMultipleLinksProps {
  href?: never
  links?: Array<{
    href: string
    title: string
  }>
}

export type LinkCard2ColumnItemLinkProps =
  | LinkCard2ColumnItemSingleLinkProps
  | LinkCard2ColumnItemMultipleLinksProps

export type LinkCard2ColumnItemProps = LinkCard2ColumnItemBaseProps &
LinkCard2ColumnItemLinkProps

export function LinkCard2ColumnItem ({
  description,
  href,
  iconAltText = '',
  links,
  title,
  homePage,
  iconType,
}: LinkCard2ColumnItemProps) {
  const icon = iconType ? LINK_CARD_ICONS[iconType] : undefined

  return (
    <LinkCard2ColumnItemContainer
      href={links?.length ? undefined : href}
      homePage={homePage}
    >
      {icon && (
        <div className="mr-4 mb-4 max-w-[58px] shrink-0 grow-0 basis-[58px] md:max-w-[84px] md:basis-[84px]">
          <img
            src={icon}
            alt={iconAltText}
            width="100%"
            className="rounded-lg"
          />
        </div>
      )}
      <div className="w-full overflow-hidden pr-2">
        <h3 className="text-semibold mr-1 text-xl text-black dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-primary-gray-300 dark:text-primary-gray-200">
          {description}
        </p>
        {(links != null) && (
          <div className="mt-3">
            {links.map(({ title, href }) => (
              <AppLink
                className="mb-1 flex items-center justify-between text-sm font-semibold text-primary-blue hover:opacity-75 dark:text-blue-dark"
                key={title}
                to={href}
              >
                <span>{title}</span>
                <span>
                  {isLinkExternal(href)
                    ? (
                    <ExternalLinkIcon />
                      )
                    : (
                    <ChevronRight />
                      )}
                </span>
              </AppLink>
            ))}
          </div>
        )}
      </div>
    </LinkCard2ColumnItemContainer>
  )
}

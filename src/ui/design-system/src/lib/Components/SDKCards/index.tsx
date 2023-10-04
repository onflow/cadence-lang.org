import React from 'react'
import { ButtonLink } from "../Button"
import { HeaderWithLink } from "../HeaderWithLink"
import { SDKCard, SDKCardProps } from "../SDKCard"

export type SDKCardsProps = {
  header?: string
  headerLink?: string
  cards: SDKCardProps[]
  description?: string
  showViewAll?: boolean
}

export function SDKCards({
  header = "SDK's",
  cards,
  description,
  headerLink = "",
  showViewAll,
}: SDKCardsProps) {
  return (
    <div className="container">
      <div className="mb-10 flex items-center justify-between">
        <div>
          {header && (
            <HeaderWithLink className="text-h2" headerLink={headerLink}>
              {header}
            </HeaderWithLink>
          )}
          {description && (
            <p className="mt-2 max-w-[640px] text-primary-gray-400 dark:text-primary-gray-100">
              {description}
            </p>
          )}
        </div>
        {showViewAll && (
          <ButtonLink
            rightIcon="right"
            variant="secondary"
            className="hidden md:inline-flex"
            href="/tools/clients"
          >
            View All SDKs
          </ButtonLink>
        )}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3 md:gap-8">
        {cards.map((sdkCard, i) => (
          <SDKCard key={i} {...sdkCard} />
        ))}
      </div>
      {/* hidden for now */}
      {/* <ButtonLink variant="primary" className="w-full md:hidden" href="#">
        View All SDKs
      </ButtonLink> */}
    </div>
  )
}

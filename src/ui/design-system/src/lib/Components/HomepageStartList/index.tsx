import React from 'react'
import { HeaderWithLink } from '../HeaderWithLink'
import { HomepageStartItem, type HomepageStartItemProps } from '../HomepageStartItem'

export interface HomepageStartListProps {
  items: HomepageStartItemProps[]
}

export function HomepageStartList ({ items }: HomepageStartListProps) {
  return (
    <div className="container">
      <HeaderWithLink headerLink={''} className="text-h2 pb-10">
        Start Building Today
      </HeaderWithLink>
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-${items.length} md:gap-8`}
      >
        {items.map((itemData: HomepageStartItemProps, index: number) => (
          <HomepageStartItem key={index} {...itemData} />
        ))}
      </div>
    </div>
  )
}

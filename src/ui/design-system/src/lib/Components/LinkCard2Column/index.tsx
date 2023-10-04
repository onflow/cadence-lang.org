import React from 'react'
import clsx from 'clsx'
import { Heading } from '../Heading'
import {
  LinkCard2ColumnItem,
  type LinkCard2ColumnItemProps,
} from './LinkCard2ColumnItem'

export interface LinkCard2ColumnProps {
  buttonText: string
  buttonUrl: string
  description: string
  items: LinkCard2ColumnItemProps[]
  tags?: string[]
  title: string
  bottomRounded?: boolean
  homePage?: boolean
}

export function LinkCard2Column ({
  items,
  bottomRounded = true,
  homePage = false,
}: LinkCard2ColumnProps) {
  const classes = clsx(
    'flex flex-col items-start px-4 py-12 rounded-lg bg-primary-gray-100/30 md:flex-col md:px-20',
    homePage ? 'dark:bg-[#1F232A]' : 'dark:bg-primary-gray-dark',
    {
      'rounded-br-none rounded-bl-none': !bottomRounded,
    }
  )

  return (
    <div className="container pb-12">
      <div className={classes}>
        <Heading className="text-h2 pb-10">Start Building Today</Heading>
        <div className="flex w-full flex-1 flex-row items-stretch justify-between">
          {items.map((item) => (
            <LinkCard2ColumnItem
              key={item.title}
              {...item}
              homePage={homePage}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

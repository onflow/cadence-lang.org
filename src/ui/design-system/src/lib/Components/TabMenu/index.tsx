import React, { useState } from 'react'
import { useLocation } from '@docusaurus/router'
import clsx from 'clsx'
import AppLink from '../AppLink'

interface Tab {
  name: string
  link?: string
}

export interface TabMenuProps {
  tabs: Tab[]
  onTabChange?: any
  defaultTabIndex?: number
  centered?: boolean
}

const tabClasses =
  'relative cursor-pointer py-4 text-center text-black hover:text-primary-gray-400 dark:text-white hover:dark:text-primary-gray-100 md:py-6'

const TabMenu = ({
  tabs,
  onTabChange,
  centered,
  defaultTabIndex = 0,
}: TabMenuProps) => {
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(defaultTabIndex)

  return (
    <div
      className={clsx(
        'flex justify-start gap-4 overflow-x-auto border-b border-primary-gray-100 text-sm dark:border-primary-gray-300 md:text-base',
        {
          'md:justify-center': centered,
        }
      )}
    >
      {tabs.map(({ name, link }: Tab, index) => {
        const isCurrentIndex = link
          ? location.pathname === link
          : activeIndex === index

        const indicatorClasses = clsx(
          'absolute bottom-0 w-full bg-black rounded-tr-lg rounded-tl-lg h-[6px] dark:bg-white',
          { block: isCurrentIndex, hidden: !isCurrentIndex }
        )

        if (link) {
          return (
            <AppLink key={name} to={link} className={tabClasses}>
              <span
                className={clsx(
                  'whitespace-nowrap px-4 text-sm md:px-6 md:text-base',
                  isCurrentIndex ? '-mx-[1px] font-bold' : ''
                )}
              >
                {name}
              </span>
              <div className={indicatorClasses} />
            </AppLink>
          )
        }

        return (
          <div
            key={name}
            role="button"
            onClick={() => {
              setActiveIndex(index)
              onTabChange(index, name)
            }}
            className={tabClasses}
          >
            <span
              className={clsx(
                'whitespace-nowrap px-4 text-sm md:px-6 md:text-base',
                isCurrentIndex ? '-mx-[1px] font-bold' : ''
              )}
            >
              {name}
            </span>
            <div className={indicatorClasses} />
          </div>
        )
      })}
    </div>
  )
}

export default TabMenu

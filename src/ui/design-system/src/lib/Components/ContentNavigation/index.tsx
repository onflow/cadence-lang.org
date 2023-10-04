import React from 'react'
import ChevronRight from "../../../../images/arrows/chevron-right.svg"
import AppLink from "../AppLink"
import {
  ContentNavigationIcon,
  ContentNavigationIconProps,
} from "./ContentNavigationIcon"

export type ContentNavigationProps = {
  title: string
  text: string
  link: string
} & ContentNavigationIconProps

export function ContentNavigation({
  title,
  text,
  link,
  icon,
}: ContentNavigationProps) {
  return (
    <AppLink
      className="flex cursor-pointer gap-6 rounded-lg bg-primary-gray-100/40 py-10 pl-10 pr-7 text-gray-700 hover:bg-primary-gray-100/75"
      to={link}
    >
      <div className="flex min-w-0 grow flex-col justify-start">
        <div className="mb-3 text-primary-gray-400 dark:text-primary-gray-100">
          <ContentNavigationIcon icon={icon} />
        </div>
        <div className="mb-2 truncate text-ellipsis whitespace-nowrap font-display text-lg font-bold dark:text-white lg:text-2xl">
          {title}
        </div>
        <div className="dark:text-primary-gray-100">{text}</div>
      </div>
      <div className="flex flex-col justify-center text-black dark:text-primary-gray-100">
        <ChevronRight />
      </div>
    </AppLink>
  )
}

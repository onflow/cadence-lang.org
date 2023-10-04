import React from 'react';
import AppLink from '../AppLink';
import {
  HomepageStartItemIcons,
  type HomepageStartItemIconsProps,
} from './HomepageStartIcons';

export type HomepageStartItemProps = {
  title: string;
  text: string;
  link: string;
} & HomepageStartItemIconsProps;

export function HomepageStartItem({
  title,
  text,
  link,
  icon,
}: HomepageStartItemProps) {
  return (
    <AppLink
      className="flex cursor-pointer gap-6 rounded-lg bg-primary-gray-100/40 py-8 pl-8 pr-4 text-gray-700 hover:no-underline"
      to={link}
    >
      <div className="flex min-w-0 grow flex-col items-start justify-start">
        <div className="mb-3 text-primary-gray-400 dark:text-primary-gray-100">
          <HomepageStartItemIcons icon={icon} />
        </div>
        <div className="mb-2 truncate text-ellipsis whitespace-nowrap font-display text-lg font-bold dark:text-white lg:text-2xl">
          {title}
        </div>
        <div className="text-start dark:text-primary-gray-100">{text}</div>
      </div>
    </AppLink>
  );
}

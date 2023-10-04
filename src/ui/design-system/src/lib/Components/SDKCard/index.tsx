import React from 'react';
import CalendarIcon from '../../../../images/action/date-calendar.svg';
import StarIcon from '../../../../images/action/star.svg';
import CommitIcon from '../../../../images/content/commit.svg';
import AppLink from '../AppLink';
import Tag from '../Tag';
import { Time } from '../Time';

const CodeIconSrc = '/images/tools/tool-default.svg';

export interface SDKCardProps {
  title: string;
  authorIcon?: string;
  authorName?: string;
  tags?: string[];
  link: string;
  stars?: number;
  lastCommit?: string;
  lastRelease?: string;
  iconSrc?: string;
  iconDarkModeSrc?: string;
  description?: string;
}

export function SDKCard({
  title,
  authorIcon,
  authorName,
  tags,
  link,
  stars,
  iconSrc,
  iconDarkModeSrc,
  lastCommit,
  lastRelease,
  description,
}: SDKCardProps): JSX.Element {
  return (
    <AppLink
      className="flex gap-4 rounded-lg bg-white px-8 py-6 hover:shadow-2xl dark:bg-primary-gray-dark dark:text-white dark:hover:shadow-2xl-dark"
      to={link}
    >
      <div className="shrink-0 grow-0 sm:basis-10 md:basis-16">
        <img
          className="dark:hidden"
          src={iconSrc ?? CodeIconSrc ?? ''}
          alt={title}
          width={64}
          loading="lazy"
        />
        <img
          className="hidden dark:block"
          src={iconDarkModeSrc ?? iconSrc ?? CodeIconSrc}
          alt={title}
          width={64}
          loading="lazy"
        />
      </div>
      <div className="grow">
        <h5 className="text-h5">{title}</h5>
        <div className="flex items-center">
          <div className="flex shrink-0 items-center gap-2 pr-3 md:pr-4">
            {authorIcon && (
              <div>
                <img src={authorIcon} alt={authorName} width={24} height={24} />
              </div>
            )}
            {authorName && (
              <div className="dark:gray-400 md:leading-1 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {authorName}
              </div>
            )}
          </div>
          {stars !== undefined && (
            <div className="flex shrink-0 items-center gap-1">
              <StarIcon
                className="mb-1 text-amber-400"
                height={16}
                width={16}
              />
              <div className="md:leading-1 h-fit text-sm text-gray-500 dark:text-gray-300">
                {stars}
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 py-1 pr-1 line-clamp-1">
          {tags?.map((tag, i) => (
            <Tag name={tag} key={i} />
          ))}
        </div>
        {description ? (
          <div className="pt-2 text-gray-700 line-clamp-2 dark:text-gray-300">
            {description}
          </div>
        ) : (
          <div className="align-center -mb-1 grid w-fit grid-cols-1 gap-x-4 justify-self-center pt-6 text-gray-500 md:grid-cols-2 ">
            {lastRelease && (
              <div className="flex items-center">
                <CalendarIcon
                  className="mr-3 stroke-gray-500"
                  width={22}
                  height={18}
                />
                <div>{lastRelease} days ago</div>
              </div>
            )}
            {lastCommit && (
              <div className="flex items-center">
                <CommitIcon
                  className="mr-3 fill-gray-500"
                  width={22}
                  height={22}
                />
                <Time value={lastCommit} />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLink>
  );
}

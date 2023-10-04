import React from 'react';
import StarIcon from '../../../../images/action/star.svg';
import AppLink from '../AppLink';
import Tag from '../Tag';

const CodeIconSrc = '/images/tools/tool-default.svg';

export interface ToolCardProps {
  authorIcon?: string;
  authorName?: string;
  description?: string;
  iconSrc?: string;
  iconDarkModeSrc?: string;
  link: string;
  stars?: number;
  tags?: string[];
  title: string;
}

export function ToolCard({
  authorIcon,
  authorName,
  description,
  iconSrc,
  iconDarkModeSrc,
  link,
  stars,
  tags,
  title,
}: ToolCardProps): JSX.Element {
  return (
    <AppLink
      className="flex gap-4 rounded-lg bg-white px-8 py-6 hover:shadow-2xl dark:bg-primary-gray-dark dark:text-white dark:hover:shadow-2xl-dark"
      to={link}
    >
      <div className="shrink-0 grow-0 sm:basis-10 md:basis-16">
        <img
          className="dark:hidden"
          src={iconSrc ?? CodeIconSrc}
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
            {Boolean(authorIcon) && (
              <div className="h-6 w-6">
                <img src={authorIcon} alt={authorName} className="w-full" />
              </div>
            )}
            {Boolean(authorName) && (
              <div className="dark:gray-400 md:leading-1 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {authorName}
              </div>
            )}
          </div>
          {stars !== undefined && (
            <div className="flex shrink-0 items-center gap-1">
              <StarIcon
                className="mb-1 text-amber-400"
                width={16}
                height={16}
              />
              <div className="text-sm text-gray-500 dark:text-gray-300">
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
        <div className="pt-2 text-gray-700 line-clamp-2 dark:text-gray-300">
          {description}
        </div>
      </div>
    </AppLink>
  );
}

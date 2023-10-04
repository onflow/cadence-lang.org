import React from 'react';
import {
  ContentNavigation,
  type ContentNavigationProps,
} from '../ContentNavigation';
import { HeaderWithLink } from '../HeaderWithLink';

export interface ContentNavigationListProps {
  header: string;
  contentNavigationItems: ContentNavigationProps[];
  headerLink?: string;
}

export function ContentNavigationList({
  contentNavigationItems,
  header,
  headerLink = '',
}: ContentNavigationListProps) {
  return (
    <div className="container">
      <HeaderWithLink headerLink={headerLink} className="text-h2 pb-10">
        {header}
      </HeaderWithLink>
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8`}>
        {contentNavigationItems.map(
          (contentNav: ContentNavigationProps, index: number) => (
            <ContentNavigation key={index} {...contentNav} />
          ),
        )}
      </div>
    </div>
  );
}

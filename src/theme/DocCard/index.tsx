// swizzled component from a standard DocCard
import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  findFirstCategoryLink,
  useDocById,
} from '@docusaurus/theme-common/internal';
import isInternalUrl from '@docusaurus/isInternalUrl';
import { translate } from '@docusaurus/Translate';
import type { Props } from '@theme/DocCard';

import styles from './styles.module.css';
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs';
import { CardSubtitle } from './CardSubtitle';
import { CustomIcon } from './CustomIcon';

function CardContainer({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Link
      href={href}
      className={clsx('card padding--lg', styles.cardContainer)}
    >
      {children}
    </Link>
  );
}

function CardLayout({
  href,
  icon,
  title,
  description,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
  subtitle?: ReactNode;
}): JSX.Element {
  return (
    <CardContainer href={href}>
      <h2 className={clsx('text--truncate', styles.cardTitle)} title={title}>
        <div className="flex gap-2">
          <div className="flex-none">{icon}</div>
          <div className="flex flex-col gap-1">
            <span>{title}</span>
            {Boolean(subtitle) && subtitle}
          </div>
        </div>
      </h2>
      {description && (
        <p
          className={clsx(styles.preWrap, styles.cardDescription)}
          title={description}
        >
          {description}
        </p>
      )}
    </CardContainer>
  );
}

function CardCategory({
  item,
}: {
  item: PropSidebarItemCategory;
}): JSX.Element | null {
  const href = findFirstCategoryLink(item);

  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }

  return (
    <CardLayout
      href={href}
      icon={item.customProps?.icon || '🗃️'}
      title={item.label}
      description={
        item.description ??
        item.customProps?.description ??
        translate(
          {
            message: '{count} items',
            id: 'theme.docs.DocCard.categoryDescription',
            description:
              'The default description for a category card in the generated index about how many items this category includes',
          },
          { count: item.items.length },
        )
      }
    />
  );
}

function CardLink({ item }: { item: PropSidebarItemLink }): JSX.Element {
  const { customProps } = item;
  const customIcon = <CustomIcon customProps={customProps} />;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const icon = customIcon || (isInternalUrl(item.href) ? '📄️' : '🔗');
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      description={item.description ?? doc?.description}
      subtitle={<CardSubtitle customProps={item?.customProps}/>}
    />
  );
}

export default function DocCard({ item }: Props): JSX.Element {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}

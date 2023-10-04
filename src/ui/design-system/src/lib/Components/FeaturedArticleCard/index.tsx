import React from 'react'
import clsx from 'clsx'
import { ButtonLink } from '../Button'
import Tag from '../Tag'

export interface FeaturedArticleCardProps {
  bg?: string
  heading: string
  tags?: string[]
  link: string
  description?: string
  ctaText?: string
}

const FeaturedArticleCard = ({
  bg = 'bg-white dark:bg-primary-gray-dark',
  heading,
  tags,
  link,
  description,
  ctaText,
}: FeaturedArticleCardProps) => {
  return (
    <div
      className={clsx(bg, 'rounded-lg px-8 py-12 md:py-[122px] md:px-[80px]')}
    >
      {tags?.map((tag) => (
        <Tag name={tag} key={tag} />
      ))}
      <div className="text-h2 my-2">{heading}</div>
      {description && (
        <p className="mb-14 text-primary-gray-300 dark:text-primary-gray-200">
          {description}
        </p>
      )}
      <ButtonLink href={link} className="px-6 py-4">
        {ctaText || heading}
      </ButtonLink>
    </div>
  )
}

export default FeaturedArticleCard

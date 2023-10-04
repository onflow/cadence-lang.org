import React from 'react'
import { type Article } from '../../interfaces'
import { ButtonLink } from '../Button'
import { Carousel, type CarouselProps } from '../Carousel'
import { HeaderWithLink } from '../HeaderWithLink'

export type FeaturedArticleSliderProps = CarouselProps & {
  articles: Article[]
  headerLink?: string
}

export const FeaturedArticle = ({
  heading,
  description,
  ctaLink,
  ctaText,
  imageUrl,
}: Article) => (
  <div className="flex min-h-fit flex-col-reverse overflow-hidden rounded-2xl bg-white dark:bg-primary-gray-dark md:min-h-[30rem] md:flex-row">
    <div className="min-w-[50%] self-center py-10 pl-6 pr-6 md:pr-32 md:pl-20">
      <h3 className="text-h3">{heading}</h3>
      <p className="py-6 text-primary-gray-300 dark:text-primary-gray-100">
        {description}
      </p>
      <ButtonLink
        href={ctaLink}
        className="rounded-lg bg-black px-16 py-4 text-center text-white hover:cursor-pointer"
        variant="primary-no-darkmode"
      >
        {ctaText}
      </ButtonLink>
    </div>
    <div
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
      className="cover min-h-[8rem] w-full"
    />
  </div>
)

const FeaturedArticleSlider = ({
  articles,
  breakpoint = 'none',
  carouselItemWidth = 'w-10/12 md:w-full',
  headerLink = '',
  ...carouselProps
}: FeaturedArticleSliderProps) => {
  return (
    <div className="container">
      <HeaderWithLink className="text-h2 mb-10" headerLink={headerLink}>
        Featured article{articles.length > 0 ? 's' : ''}
      </HeaderWithLink>

      <Carousel
        breakpoint={breakpoint}
        carouselItemWidth={carouselItemWidth}
        {...carouselProps}
      >
        {articles.map((article) => (
          <FeaturedArticle
            key={`${article.heading}-${article.ctaLink}`}
            {...article}
          />
        ))}
      </Carousel>
    </div>
  )
}

export default FeaturedArticleSlider

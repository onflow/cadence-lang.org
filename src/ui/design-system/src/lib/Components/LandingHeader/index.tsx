import React from 'react'
import LandingImage from "../../../../images/misc/landing-home.png"
import { ButtonLink } from "../Button"

export type LandingHeaderProps = {
  buttonText: string
  buttonUrl: string
  callout: string
  description: string
  discordUrl: string

  /**
   * The URL to the page on github that allows editing this page's content
   */
  editPageUrl?: string
  githubUrl: string
  imageSrc?: string
  title: string
}

export function LandingHeader({
  buttonText,
  buttonUrl,
  callout,
  description,
  imageSrc = LandingImage,
  title,
}: LandingHeaderProps) {
  return (
    <div className="container mx-auto flex flex-col justify-items-stretch py-16">
      <h1 className="text-h1 mt-4 mb-10 max-w-full overflow-hidden text-ellipsis !text-4xl md:!text-6xl md:!leading-tight">
        {title}
      </h1>
      <div className="flex flex-row items-stretch justify-between overflow-hidden rounded-lg bg-primary-gray-100/30">
        <div className="flex flex-1 flex-col justify-center py-8 pl-8 pr-8 md:basis-1/2 md:pl-20 md:pr-10">
          <h2 className="text-h2 mb-2 md:mb-4">{callout}</h2>
          <p>{description}</p>
          <div>
            <ButtonLink
              className="mt-4 transition duration-200"
              href={buttonUrl}
              variant="primary-no-darkmode"
            >
              {buttonText}
            </ButtonLink>
          </div>
        </div>
        <div className="hidden max-w-[554px] dark:bg-white/40 md:flex">
          <img src={imageSrc} alt={title} className="object-cover" />
        </div>
      </div>
    </div>
  )
}

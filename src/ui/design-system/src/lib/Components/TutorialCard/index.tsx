import clsx from "clsx"
import React, { forwardRef } from "react"
import CalendarIcon from "../../../../images/action/date-calendar.svg"
import UserIcon from "../../../../images/arrows/user.svg"
import TutorialIcon from "../../../../images/content/drafting-tools.svg"
import { User } from "../../interfaces"
import Tag from "../Tag"
import { TutorialCardIconType, TUTORIAL_CARD_ICONS } from "./icons"

export type TutorialCardPropsImageUri = {
  author?: User
  className?: string
  description: string
  heading: string
  imageUri?: string
  lastUpdated?: string
  level?: string
  link: string
  tags: string[]
}

export type TutorialCardPropsImagePreset = TutorialCardPropsImageUri & {
  imageUri: never
  imageType: TutorialCardIconType
}

export type TutorialCardProps =
  | TutorialCardPropsImagePreset
  | TutorialCardPropsImageUri

const TutorialCard = forwardRef<HTMLAnchorElement, TutorialCardProps>(
  (
    {
      className,
      heading,
      tags,
      description,
      lastUpdated,
      level,
      link,
      author,
      ...props
    },
    ref
  ) => {
    const imageUri =
      ("imageType" in props
        ? TUTORIAL_CARD_ICONS[props.imageType]
        : props.imageUri) || TUTORIAL_CARD_ICONS.default

    return (
      // TODO: switch to AppLink
      <a
        ref={ref}
        href={link}
        className={clsx(
          "flex flex-col overflow-hidden rounded-lg bg-white hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark",
          className
        )}
      >
        {imageUri && (
          <img
            src={imageUri}
            alt={heading}
            className="h-[110px] object-cover"
          />
        )}
        <div className="flex h-full flex-col justify-between px-4 pt-8 pb-4">
          <div className="mb-6">
            <div className="text-lg font-bold md:text-xl">{heading}</div>
            <div className="my-1 inline-flex flex-wrap">
              {tags.map((tag) => (
                <span className="my-1" key={tag}>
                  <Tag name={tag} />
                </span>
              ))}
            </div>
            <div className={imageUri ? "line-clamp-6" : "line-clamp-8"}>
              {description}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-primary-gray-300 dark:text-primary-gray-200">
              {lastUpdated && (
                <div className="-ml-1.5 flex items-center">
                  <CalendarIcon
                    className="mr-1 scale-75"
                    width="36"
                    height="36"
                  />
                  {lastUpdated}
                </div>
              )}
              {level && (
                <div className="flex items-center">
                  <TutorialIcon className="mr-1" />
                  {level}
                </div>
              )}
            </div>
            {author && (
              <div className="text-xs text-primary-gray-300 dark:text-primary-gray-200">
                <div className="flex items-center">
                  <UserIcon className="mr-1 scale-75" />
                  {author.name}
                </div>
              </div>
            )}
          </div>
        </div>
      </a>
    )
  }
)

TutorialCard.displayName = "TutorialCard"

export default TutorialCard

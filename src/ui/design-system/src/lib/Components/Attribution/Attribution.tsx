import clsx from "clsx"
import { dateYYYYMMDD } from "../../utils/dates"
import AppLink from "../AppLink"
import CalendarIcon from "./CalendarIcon"
import ClockIcon from "./ClockIcon"
import DifficultyIcon from "./DifficultyIcon"

export type AttributionProps = {
  updatedDate: string
  authorName: string
  commitUrl: string
  authorIcon?: string
  otherAuthorsCount?: number
  readMinutes?: number
  difficulty?: string
}

const Section = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div className={clsx("flex flex-wrap items-center gap-1", className)}>
    {children}
  </div>
)

export function Attribution({
  updatedDate,
  authorName,
  authorIcon,
  otherAuthorsCount,
  commitUrl,
  readMinutes,
  difficulty,
}: AttributionProps) {
  const authorUrl = `https://www.github.com/${authorName}`
  return (
    <div className="flex flex-col flex-wrap gap-2 border-b border-b-primary-gray-100 pt-3 pb-5 text-sm text-primary-gray-300 dark:border-b-primary-gray-300 dark:text-primary-gray-100 sm:flex-row sm:items-center sm:gap-4">
      <Section>
        <span className="mr-1">
          <CalendarIcon />
        </span>
        <span className="mt-1 mr-1">
          <AppLink to={commitUrl}>Updated: {dateYYYYMMDD(updatedDate)}</AppLink>{" "}
          by
        </span>
        {!!authorIcon && (
          <AppLink to={authorUrl}>
            <img
              src={authorIcon}
              alt={authorName}
              width={18}
              className="rounded-full"
            />
          </AppLink>
        )}
        <AppLink to={authorUrl} className="pt-1 text-black dark:text-white">
          <b>{authorName}</b>
        </AppLink>{" "}
        {otherAuthorsCount
          ? `(+${otherAuthorsCount} other${otherAuthorsCount > 1 ? "s" : ""})`
          : ""}
      </Section>
      <Section className="gap-4 sm:gap-4">
        {!!readMinutes && (
          <Section className="mt-1">
            <ClockIcon /> {Math.round(readMinutes)} min read
          </Section>
        )}
        {!!difficulty && (
          <Section>
            <DifficultyIcon /> {difficulty}
          </Section>
        )}
      </Section>
    </div>
  )
}

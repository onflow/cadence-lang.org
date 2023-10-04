import formatDistance from "date-fns/formatDistance"
import ChevronRightIcon from "../../../../images/arrows/chevron-right.svg"
import TimeIcon from "../../../../images/content/date.svg"
import AppLink from "../AppLink"

export type AnnouncementCardProps = {
  sourceIcon: string
  sourceAltText: string
  heading: string
  timestamp: Date
  link: string
}

const AnnouncementCard = ({
  heading,
  sourceIcon,
  sourceAltText,
  timestamp,
  link,
}: AnnouncementCardProps) => {
  return (
    <AppLink
      to={link}
      className="flex items-center justify-between rounded-2xl bg-white px-4 py-6 hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark md:px-8 md:py-8"
    >
      <div className="mr-4 self-start">
        <img
          src={sourceIcon}
          alt={sourceAltText}
          width={50}
          height="auto"
          className="mr-4 rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="text-2xl font-bold">{heading}</div>
        <div className="mt-4 flex items-center text-primary-gray-300">
          <TimeIcon />
          <span className="ml-2">
            {formatDistance(new Date(timestamp), new Date())} ago
          </span>
        </div>
      </div>
      <div className="md:mt-0">
        <ChevronRightIcon />
      </div>
    </AppLink>
  )
}

export default AnnouncementCard

import { formatDistance } from "date-fns"
import TimeIcon from "../../../../images/content/date.svg"
import ExternalLinkIcon from "../../../../images/content/external-link.svg"
import AppLink from "../AppLink"

export type NetworkDiscordCardProps = {
  message: string
  username: string
  timestamp: Date
  messageLink: string
}

const NetworkDiscordCard = ({
  message,
  username,
  timestamp,
  messageLink,
}: NetworkDiscordCardProps) => {
  return (
    <AppLink
      to={messageLink}
      className="w-full rounded-xl bg-white hover:cursor-pointer hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark"
    >
      <div className="border-b-1 flex-col border-b border-b-primary-gray-100 px-6 pt-6 dark:border-b-primary-gray-400">
        <div className="flex">
          <div className="text-xl">&ldquo;{message}&rdquo;</div>
          <div className="ml-auto">
            <ExternalLinkIcon />
          </div>
        </div>
        <div
          className="pb-2 text-sm text-primary-gray-300"
          style={{ lineHeight: "48px" }}
        >
          {username} on <span className="text-primary-blue">Discord</span>
        </div>
      </div>
      <div className="text-light flex items-center px-6 py-3 text-primary-gray-300">
        <TimeIcon />
        <span className="ml-2">
          {formatDistance(new Date(timestamp), new Date())} ago
        </span>
      </div>
    </AppLink>
  )
}

export default NetworkDiscordCard

import clsx from "clsx"
import CalendarIcon from "../../../../images/action/date-calendar.svg"
import CommentIcon from "../../../../images/arrows/message-circle.svg"
import { dateYYYYMMDD } from "../../utils/dates"
import AppLink from "../AppLink"
import Tag from "../Tag"
import RoundImage from "./RoundImage"

export type User = {
  profileImage: string
  name: string
}

export type FlipCellProps = {
  numComments: number
  heading: string
  tags: string[]
  repository: string
  participant: User
  date: string
  forumLink: string
}

const PARENT_GRID =
  "p-4 flex flex-col sm:p-6 md:grid gap-[25px] md:grid-cols-[56px_auto_350px]"
const RIGHT_GRID = "md:grid md:grid-cols-[80px_100px_100px_100px]"

export const FlipCellHeader = () => (
  <div
    className={clsx(
      "hidden text-xs text-primary-gray-200 dark:text-primary-gray-300 md:grid md:py-2",
      PARENT_GRID
    )}
  >
    <div />
    <div>Topic</div>
    <div className={RIGHT_GRID}>
      <div className="text-center">Submitted by</div>
      <div className="text-center">Repository</div>
      <div className="text-center">Date submitted</div>
      <div className="text-center">Comments</div>
    </div>
  </div>
)

const FlipCell = ({
  heading,
  tags,
  repository,
  participant,
  numComments,
  date,
  forumLink,
}: FlipCellProps) => {
  return (
    <AppLink
      to={forumLink}
      className={clsx(
        "rounded-lg bg-white hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark",
        PARENT_GRID
      )}
    >
      <div className="hidden justify-end md:flex">
        <svg
          className="hidden md:inline-flex"
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="18" cy="18" r="17.5" stroke="#47FFB2" />
          <circle cx="18" cy="18" r="5.5" fill="#47FFB2" stroke="#47FFB2" />
        </svg>
      </div>
      <div className="flex flex-col">
        <p className="mb-1 text-lg font-semibold text-black dark:text-white md:text-xl">
          {heading}
        </p>
        <div>
          {tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
      </div>
      <div
        className={clsx(
          "flex justify-between text-primary-gray-300 dark:text-primary-gray-100",
          RIGHT_GRID
        )}
      >
        <div className="flex items-center justify-center">
          <RoundImage
            imageUri={participant.profileImage}
            imageCaption={participant.name}
            altText={participant.name}
          />
        </div>
        <div className="flex items-center justify-center">
          <div className="dark:gray-400 md:leading-1 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {repository}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <CalendarIcon width="24" height="24" />{" "}
          <span className="ml-1 sm:ml-2">{dateYYYYMMDD(date)}</span>
        </div>
        <div className="flex items-center justify-center">
          <CommentIcon /> <span className="ml-1 sm:ml-2">{numComments}</span>
        </div>
      </div>
    </AppLink>
  )
}

export default FlipCell

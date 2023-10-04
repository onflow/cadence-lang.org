import clsx from "clsx"
import { EventCardProps, OFFICE_HOURS_EVENT_TYPE } from "../EventCard"
import Tag from "../Tag"
import OfficeHoursImage from "../../../../images/misc/office-hours.png"

export function EventCardSmall({
  onClick,
  location = "Online",
  imageAlt = "",
  imageSrc,
  tags,
  title,
  eventDate,
  selected,
  eventType,
}: EventCardProps & { selected?: boolean }) {
  const image =
    !imageSrc && eventType === OFFICE_HOURS_EVENT_TYPE
      ? OfficeHoursImage
      : imageSrc

  return (
    <div
      role="button"
      className={clsx(
        "mb-4 flex min-w-max max-w-sm items-start rounded-lg border-4 bg-white px-6 py-5 dark:bg-primary-gray-dark",
        selected
          ? "cursor-default border-primary-gray-100/50 bg-primary-gray-50/20 dark:border-primary-gray-400/50 dark:bg-primary-gray-dark/20"
          : "cursor-pointer border-transparent hover:shadow-2xl dark:hover:shadow-2xl-dark"
      )}
      onClick={onClick}
    >
      <img
        src={image}
        alt={imageAlt}
        className="h-[84px] w-[84px] flex-initial basis-[84px] rounded-md object-cover"
      />
      <span className="mx-5 flex flex-1 flex-col">
        <h3 className="text-h5 max-w-[220px] truncate">{title}</h3>
        {tags && tags.length > 0 && (
          <span className="max-w-[220px] truncate">
            {tags.map((tag) => (
              <Tag key={tag} name={tag} />
            ))}
          </span>
        )}
        <span className="mt-1 mb-2 text-primary-gray-300 dark:text-primary-gray-100">
          {eventDate}
        </span>
        <span className="text-sm text-primary-gray-200">{location}</span>
      </span>
    </div>
  )
}

import React, { useMemo, useState } from "react"
import { OFFICE_HOURS_EVENT_TYPE } from "../../../../../../data/events"
import { ButtonLink } from "../Button"
import { EventCard, EventCardList, EventCardProps } from "../EventCard"
import { EventCardSmall } from "../EventCardSmall"
import { HeaderWithLink } from "../HeaderWithLink"

export type UpcomingEventsProps = {
  goToCommunityHref: string
  events: [EventCardProps, ...EventCardProps[]] | []
  headerLink?: string
}

const FILTERS = [OFFICE_HOURS_EVENT_TYPE]

export function UpcomingEvents({
  goToCommunityHref,
  events,
  headerLink = "",
}: UpcomingEventsProps) {
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(
    events[0]?.title ?? null
  )
  const onTabChange = (filterIndex: number) => {
    setSelectedEventTitle(null)
    setTabIndex(filterIndex)
  }

  const filteredEvents = useMemo(
    () =>
      tabIndex === 0
        ? events
        : events.filter((event) => event.eventType === FILTERS[tabIndex - 1]),
    [events, tabIndex]
  )
  const primaryEvent = useMemo(
    () =>
      events.find((e) => e.title === selectedEventTitle) || filteredEvents[0],
    [events, filteredEvents, selectedEventTitle]
  )

  if (filteredEvents.length === 0) {
    return <></>
  }

  return (
    <div className="container">
      <HeaderWithLink className="text-h2 mb-2" headerLink={headerLink}>
        Upcoming events
      </HeaderWithLink>
      <div className="py-6">
        <div className="hidden md:block">
          {primaryEvent && <EventCard {...primaryEvent} className="mb-4" />}
          <ul className="hidden list-none flex-row gap-6 overflow-x-auto md:flex">
            {filteredEvents.map((event: EventCardProps, index: number) => (
              <li key={index} className="min-w-[394px]">
                <EventCardSmall
                  {...event}
                  selected={primaryEvent?.title === event.title}
                  onClick={() => setSelectedEventTitle(event.title)}
                />
              </li>
            ))}
          </ul>
        </div>
        <EventCardList
          events={filteredEvents}
          breakpoint="none"
          className="visible mb-4 md:hidden"
          carouselItemWidth="w-10/12 md:w-full"
          indicatorSize="xs"
          indicatorSelectedColor="bg-black dark:bg-white"
          indicatorColor="bg-primary-gray-100 dark:bg-primary-gray-400"
        />
        <div className="mt-10 flex flex-col justify-items-stretch gap-6 md:flex-row">
          <ButtonLink
            className="flex-1 md:max-w-[50%]"
            variant="secondary"
            href={goToCommunityHref}
            rightIcon="external"
          >
            Go to Community
          </ButtonLink>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  )
}

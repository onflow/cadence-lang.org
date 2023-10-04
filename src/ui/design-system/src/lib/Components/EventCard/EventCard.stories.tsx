import { Meta, Story } from "@storybook/react"
import { EventCard, EventCardList, EventCardProps, EventCardListProps } from "."

export default {
  component: EventCard,
  title: "Components/EventCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const TemplateSingle: Story<EventCardProps> = (args) => {
  return <EventCard {...args} />
}

export const Default = TemplateSingle.bind({})
Default.args = {
  ctaText: "CTA text",
  description:
    "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow.",
  eventDate: "Mar 23",
  href: "#changeme",
  imageSrc:
    "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/61689102d3325e237fd44b76_unnamed%20(8).png",
  location: "Online",
  tags: ["Flow official"],
  title: "Event Title",
}

const TemplateList: Story<EventCardListProps> = (args) => {
  return <EventCardList {...args} />
}

export const EventList = TemplateList.bind({})
EventList.args = {
  events: [
    {
      ctaText: "CTA text",
      description:
        "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow.",
      eventDate: "Mar 23",
      href: "#changeme",
      imageSrc:
        "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/61689102d3325e237fd44b76_unnamed%20(8).png",
      location: "Online",
      tags: ["Flow official"],
      title: "Event Title",
    },
    {
      ctaText: "CTA text",
      description:
        "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow.",
      eventDate: "Mar 23",
      href: "#changeme",
      imageSrc:
        "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/6260a0a79495531831a4114e_kitty%20items.jpg",
      location: "Online",
      tags: ["Flow official"],
      title: "A second event",
    },
    {
      ctaText: "CTA text",
      description:
        "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow.",
      eventDate: "Mar 23",
      href: "#changeme",
      imageSrc:
        "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/62728fcb139292a43a6b082b_flovatar-may4.jpg",
      location: "Online",
      tags: ["Flow official"],
      title: "A third event",
    },
  ],
}

export const EventListSingle = TemplateList.bind({})
EventListSingle.args = {
  events: [
    {
      ctaText: "CTA text",
      description:
        "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow.",
      eventDate: "Mar 23",
      href: "#changeme",
      imageSrc:
        "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/61689102d3325e237fd44b76_unnamed%20(8).png",
      location: "Online",
      tags: ["Flow official"],
      title: "Event Title",
    },
  ],
}

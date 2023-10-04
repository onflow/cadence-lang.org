import { Meta, Story } from "@storybook/react"
import { EventCardSmall, EventCardSmallProps } from "."

export default {
  component: EventCardSmall,
  title: "Components/EventCardSmall",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<EventCardSmallProps> = (args) => {
  return <EventCardSmall {...args} />
}

export const Default = Template.bind({})
Default.args = {
  href: "https://www.onflow.org",
  eventType: "Online",
  imageSrc:
    "https://assets.website-files.com/5f6294c0c7a8cdf432b1c827/61410bc0c8d0522eea319058_Hack-blog_Flow.png",
  tags: ["Flow official"],
  title: "FLIP contest",
  when: "May 5th, 5pm",
}

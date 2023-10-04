import { Meta, Story } from "@storybook/react"
import NetworkDetailsCard, { NetworkDetailsCardProps } from "."

export default {
  component: NetworkDetailsCard,
  title: "Components/NetworkDetailsCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<NetworkDetailsCardProps> = (args) => {
  return <NetworkDetailsCard {...args} />
}
const args = {
  status: "Healthy",
  statusLink: "https://google.com",
  version: "33",
  lastSporkDate: "April, 2022",
  nextSporkDate: "April, 2022",
  rssFeed: "/feed",
}

export const Default = Template.bind({})
Default.args = args

export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

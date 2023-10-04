import { Meta, Story } from "@storybook/react"
import NetworkDiscordCard, { NetworkDiscordCardProps } from "."
import { endOfDay } from "date-fns"

export default {
  component: NetworkDiscordCard,
  title: "Components/NetworkDiscordCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<NetworkDiscordCardProps> = (args) => {
  return <NetworkDiscordCard {...args} />
}

export const Default = Template.bind({})
Default.args = {
  message: "Mainnet has been down for the past two hours",
  username: "@john_flow",
  timestamp: endOfDay(new Date()),
  messageLink: "https://google.com",
}

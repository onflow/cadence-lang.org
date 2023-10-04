import { Meta, Story } from "@storybook/react"
import NetworkCard, { NetworkCardProps } from "."

export default {
  component: NetworkCard,
  title: "Components/NetworkCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<NetworkCardProps> = (args) => {
  return <NetworkCard {...args} />
}

const args = {
  networkName: "Mainnet",
  status: "Healthy",
  version: "33",
  lastSporkDate: "April, 2022",
  nextSporkDate: "April, 2022",
  link: "https://google.com",
}
export const Default = Template.bind({})
Default.args = args

export const UnderMaintenance = Template.bind({})
UnderMaintenance.args = {
  ...args,
  status: "Under Maintenance",
}

export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

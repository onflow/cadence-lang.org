import { Meta, Story } from "@storybook/react"
import SporksCard, { SporksCardProps } from "."
import { endOfDay, endOfWeek } from "date-fns"

export default {
  component: SporksCard,
  title: "Components/SporksCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<SporksCardProps> = (args) => {
  return <SporksCard {...args} />
}

const args = {
  heading: "Mainnet 17",
  timestamp: endOfDay(new Date()),
  sporkMetadata: {
    accessNode: "access-001.mainnet15.nodes.onflow.org:9000",
    date: new Date(),
    rootHeight: "19050753",
    rootParentId:
      "ac4dbf344ce96e39e15081f1dc3fbbf6dc80532e402de9a57af847d3b35df596",
    rootStateCommit:
      "641eb088e3ce1a01ff56df2d3a14372c65a7fef44c08799eb92cd7759d1d1d2a",
    gitCommit: "f019c1dbd778ce9f92dea61349ca36003678a9ad",
    branchOrTag: "v0.22.9-patch-1-epoch-view-check-hotfix",
    dockerTag: "v0.22.9-patch-1-epoch-view-check-hotfix",
  },
  upcoming: false,
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

export const Upcoming = Template.bind({})
Upcoming.args = { ...args, upcoming: true, timestamp: endOfWeek(new Date()) }

export const UpcomingMobile = Template.bind({})
UpcomingMobile.args = {
  ...args,
  upcoming: true,
  timestamp: endOfWeek(new Date()),
}
UpcomingMobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

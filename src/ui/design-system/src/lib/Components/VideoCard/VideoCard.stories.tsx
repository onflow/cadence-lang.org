import { Meta, Story } from "@storybook/react"

import { LargeVideoCard, LargeVideoCardProps } from "./LargeVideoCard"
import { SmallVideoCard, SmallVideoCardProps } from "./SmallVideoCard"

export default {
  component: LargeVideoCard,
  title: "Components/VideoCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const LargeTemplate: Story<LargeVideoCardProps> = (args) => (
  <LargeVideoCard {...args} />
)
const SmallTemplate: Story<SmallVideoCardProps> = (args) => (
  <SmallVideoCard {...args} />
)
const SmallDarkTemplate: Story<SmallVideoCardProps> = (args) => (
  <SmallVideoCard {...args} />
)

export const Large = LargeTemplate.bind({})
Large.args = {
  title: "How to write a smart contract with Cadence",
  length: 312,
  link: "https://www.youtube.com/watch?v=pRz7EzrWchs",
}
export const Small = SmallTemplate.bind({})
Small.args = {
  title: "Long title of an article on Flow, a two liner",
  length: 312,
  tags: ["Tag", "Tag", "Tag"],
  link: "https://www.youtube.com/watch?v=pRz7EzrWchs",
}

export const SmallDark = SmallDarkTemplate.bind({})
SmallDark.args = {
  title: "Long title of an article on Flow, a two liner",
  length: 312,
  tags: ["Tag", "Tag", "Tag"],
  link: "https://www.youtube.com/watch?v=pRz7EzrWchs",
}

SmallDark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

import { Meta, Story } from "@storybook/react"
import { LowerPageNav, LowerPageNavProps } from "."

export default {
  component: LowerPageNav,
  title: "Components/LowerPageNav",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<LowerPageNavProps> = (args) => <LowerPageNav {...args} />

export const Default = Template.bind({})
Default.args = {
  next: {
    href: "#example",
    title: "Next Article Name",
  },
  prev: {
    href: "#example",
    title: "Prev Article Name",
  },
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const longTitle = Template.bind({})
longTitle.args = {
  next: {
    href: "#example",
    title: "Query Staking Info with Scripts or Events",
  },
  prev: {
    href: "#example",
    title: "Quorum Certificate and Distributed Key Generation",
  },
}

export const PreviousOnly = Template.bind({})
PreviousOnly.args = {
  prev: Default.args.prev,
}

export const NextOnly = Template.bind({})
NextOnly.args = {
  next: Default.args.next,
}

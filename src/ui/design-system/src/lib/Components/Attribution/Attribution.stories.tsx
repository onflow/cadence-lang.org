import { Meta, Story } from "@storybook/react"
import { Attribution, AttributionProps } from "./Attribution"

export default {
  component: Attribution,
  title: "Components/Attribution",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<AttributionProps> = (args) => <Attribution {...args} />

export const Default = Template.bind({})

Default.args = {
  updatedDate: "2022-07-06T17:21:44Z",
  authorIcon: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
  authorName: "@maxxP",
  commitUrl:
    "https://github.com/onflow/fcl-js/commit/7dce2943268f9671c72e012631198792e395601b",
  otherAuthorsCount: 12,
  readMinutes: 4,
  difficulty: "Beginners",
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const mobile = Template.bind({})
mobile.args = Default.args
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

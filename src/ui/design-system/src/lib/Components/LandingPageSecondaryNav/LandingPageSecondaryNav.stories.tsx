import { Meta, Story } from "@storybook/react"
import { LandingPageSecondaryNav, LandingPageSecondaryNavProps } from "."

export default {
  component: LandingPageSecondaryNav,
  title: "Components/LandingPageSecondaryNav",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<LandingPageSecondaryNavProps> = (args) => (
  <LandingPageSecondaryNav {...args} />
)

export const Default = Template.bind({})
Default.args = {
  sections: [
    {
      title: "Hi",
      hash: "#hi",
    },
    {
      title: "Title",
      hash: "#title",
    },
    {
      title: "Something",
      hash: "#something",
    },
    {
      title: "Yes",
      hash: "#yes",
    },
  ],
}

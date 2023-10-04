import { Meta, Story } from "@storybook/react"
import { TypeStyles } from "."

export default {
  component: TypeStyles,
  title: "Styles/TypeStyles",
} as Meta

const Template: Story = () => <TypeStyles />
export const Default = Template.bind({})

export const DefaultMobile = Template.bind({})
DefaultMobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

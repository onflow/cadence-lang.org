import { Meta, Story } from "@storybook/react"
import { SporkFAQPage } from "."

export default {
  component: SporkFAQPage,
  title: "Pages/SporkFAQPage",
} as Meta

const Template: Story = () => <SporkFAQPage />
export const Default = Template.bind({})

export const Mobile = Template.bind({})
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

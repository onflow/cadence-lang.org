import { Meta, Story } from "@storybook/react"
import { Colors } from "."

export default {
  component: Colors,
  title: "Styles/Colors",
  // parameters: {
  //   previewTabs: {
  //     canvas: { hidden: true },
  //   },
  //   viewMode: 'docs',
  // },
} as Meta

const Template: Story = () => <Colors />
export const Default = Template.bind({})

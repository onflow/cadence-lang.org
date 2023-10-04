import { Meta, Story } from "@storybook/react"
import { Breadcrumbs, BreadcrumbsProps } from "."

export default {
  component: Breadcrumbs,
  title: "Components/Breadcrumbs",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<BreadcrumbsProps> = (args) => <Breadcrumbs {...args} />

export const Default = Template.bind({})
Default.args = {
  items: [
    { href: "#home", title: "Home" },
    { href: "#tool", title: "Tool" },
    { href: "#quick-reference", title: "Quick reference" },
  ],
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

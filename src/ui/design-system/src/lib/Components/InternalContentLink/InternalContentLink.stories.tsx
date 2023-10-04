import { Meta, Story } from "@storybook/react"
import { InternalContentLink, LinkProps } from "."

export default {
  component: InternalContentLink,
  title: "Components/InternalContentLink",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<LinkProps> = (args) => <InternalContentLink {...args} />

export const ExternalLink = Template.bind({})
ExternalLink.args = {
  href: "http://www.example.com",
  children: "External Link",
}

export const InternalLink = Template.bind({})
InternalLink.args = {
  href: "/internal-link",
  children: "Internal Link",
}

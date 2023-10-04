import { Meta, Story } from "@storybook/react"
import { HeaderWithLink, HeaderWithLinkProps } from "."

export default {
  component: HeaderWithLink,
  title: "Components/HeaderWithLink",
} as Meta

const Template: Story<HeaderWithLinkProps> = (args) => {
  return <HeaderWithLink {...args}>Header</HeaderWithLink>
}

export const Default = Template.bind({})
Default.args = {
  headerLink: "#header",
}

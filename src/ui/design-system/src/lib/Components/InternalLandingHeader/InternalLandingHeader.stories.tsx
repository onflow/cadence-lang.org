import { Meta, Story } from "@storybook/react"
import { InternalLandingHeader, InternalLandingHeaderProps } from "."

export default {
  component: InternalLandingHeader,
  title: "Components/InternalLandingHeader",
} as Meta

const Template: Story<InternalLandingHeaderProps> = (args) => {
  return <InternalLandingHeader {...args} />
}

export const Default = Template.bind({})
Default.args = {
  toolName: "cadence",
  description:
    "Cadence is a resource-oriented programming language that introduces new features to smart contract programming that help developers ensure that their code is safe, secure, clear, and approachable. Some of these features are:",
  headerCards: [
    {
      title: "Key reference",
      tags: ["Tutorial"],
      description: "Lorem ipsum about this link",
      href: "#",
    },
    {
      title: "Key reference",
      tags: ["Tutorial", "Cadence"],
      description: "Lorem ipsum about this link",
      href: "#",
    },
    {
      title: "Key reference",
      tags: ["Tutorial"],
      description: "Lorem ipsum about this link",
      href: "#",
    },
  ],
}

export const DefaultMobile = Template.bind({})
DefaultMobile.args = Default.args
DefaultMobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

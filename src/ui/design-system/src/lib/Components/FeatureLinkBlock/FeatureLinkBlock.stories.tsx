import { Meta, Story } from "@storybook/react"
import { FeatureLinkBlock, FeatureLinkBlockProps } from "."
import FclIconSrc from "../../../../images/tools/tool-fcl.svg"

export default {
  component: FeatureLinkBlock,
  title: "Components/FeatureLinkBlock",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<FeatureLinkBlockProps> = (args) => {
  return <FeatureLinkBlock {...args} />
}

export const Default = Template.bind({})
Default.args = {
  ctaLink: "",
  ctaText: "Get started",
  description:
    "Everything you need to start building on Flow is lorem ipsum Everything",
  iconSrc: FclIconSrc,
  links: [
    {
      href: "#reference",
      title: "Flow client library reference",
    },
    {
      href: "#tutorial",
      title: "This is a tutorial",
    },
    {
      href: "#transactions",
      title: "Transactions",
    },
    {
      href: "https://www.onflow.org",
      title: "External",
    },
    {
      href: "#scripts",
      title: "Scripts",
    },
  ],
  title: "Flow Client Library",
}

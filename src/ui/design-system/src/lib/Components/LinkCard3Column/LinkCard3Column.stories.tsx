import { Meta, Story } from "@storybook/react"
import { LinkCard3Column, LinkCard3ColumnProps } from "."
import EcosystemIcon from "../../../../images/content/ecosystem.svg"
import SDKIcon from "../../../../images/content/sdk.svg"
import UseCaseIcon from "../../../../images/content/use-cases.svg"

export default {
  component: LinkCard3Column,
  title: "Components/LinkCard3Column",
  parameters: {
    layout: "centered",
  },
} as Meta

const Template: Story<LinkCard3ColumnProps> = (args) => {
  return <LinkCard3Column {...args} />
}

export const Default = Template.bind({})
Default.args = {
  buttonText: "Get Started",
  buttonUrl: "#changeme",
  description:
    "Building on Flow is easy. Start building now with lorem ipsum et sigitus loranum prospitarius.",
  title: "Start Your Project",
  tags: ["Tag", "Lorem", "Ipsum"],
  items: [
    {
      title: "Quickstart",
      description:
        "A package used to interact with user wallets and the Flow blockchain.",
      icon: <UseCaseIcon height="1.5em" width="1.5em" />,
      links: [
        {
          title: "Quickstart tutorial",
          href: "#tutorial1",
          tags: ["tutorial"],
        },
        {
          title: "Name of a tutorial",
          href: "#tutorial2",
          tags: ["tutorial"],
        },
        {
          title: "Name of another tutorial",
          href: "#tutorial3",
          tags: ["tutorial"],
        },
      ],
    },
    {
      title: "Guides & Tutorials",
      description:
        "An up to 3-line blurb here describing the section lorem ipsum dolor sit amet proin.",
      icon: <EcosystemIcon height="1.5em" width="1.5em" />,
      links: [
        {
          title: "Guide 1",
          href: "#tutorial1",
          tags: ["tutorial"],
        },
        {
          title: "Guide 2",
          href: "#tutorial2",
        },
        {
          title: "An external link",
          href: "https://www.onflow.org",
          tags: ["tutorial", "external"],
        },
      ],
    },
    {
      title: "Smart Contracts",
      description: "Smart contracts description.",
      icon: <SDKIcon height="1.5em" width="1.5em" />,
      links: [
        {
          title: "Name of a Smart Contract tutorial",
          href: "#tutorial1",
          tags: ["tutorial"],
        },
        {
          title: "Name of a tutorial",
          href: "#tutorial2",
          tegs: ["tag1", "tag2", "tag3", "tag4"],
        },
        {
          title: "View all SDK's",
          href: "#sdks",
        },
      ],
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

export const DefaultDark = Template.bind({})
DefaultDark.args = Default.args
DefaultDark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

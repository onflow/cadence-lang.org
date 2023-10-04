import { Meta, Story } from "@storybook/react"
import { LinkCard2Column, LinkCard2ColumnProps } from "."

export default {
  component: LinkCard2Column,
  title: "Components/LinkCard2Column",
  parameters: {
    layout: "centered",
  },
} as Meta

const Template: Story<LinkCard2ColumnProps> = (args) => {
  return <LinkCard2Column {...args} />
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
      title: "Title Here 1 Line Only",
      description:
        "A package used to interact with user wallets and the Flow blockchain.",
      href: "https://www.onflow.org",
      iconType: "cadence",
    },
    {
      title: "Internal single link example",
      description: "This is an example of an item with a single internal link.",
      href: "#create-non-fungible-token",
      iconType: "fcl",
    },
    {
      title: "Create Non Fungible Token",
      description:
        "A package used to interact with user wallets and another line lorem ipsum ",
      links: [
        {
          title: "Dictionaries",
          href: "#dictionaries",
        },
        {
          title: "Path finders for NFT's",
          href: "#path-finders-for-nfts",
        },
        {
          title: "External link",
          href: "https://www.onflow.org",
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

export const NoTags = Template.bind({})
NoTags.args = {
  ...Default.args,
  tags: undefined,
  items: Default.args?.items?.slice(0, 2),
}

export const SingleItem = Template.bind({})
SingleItem.args = {
  ...Default.args,
  items: Default.args?.items?.slice(1, 2),
}

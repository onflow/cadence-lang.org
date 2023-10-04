import { Meta, Story } from "@storybook/react"
import HomePage, { HomePageProps } from "."
import { LinkCard2ColumnProps } from "../../.."
import { Default as DefaultFlips } from "../../Components/Flips/Flips.stories"
import { Default as DefaultUpcomingEvents } from "../../Components/UpcomingEvents/UpcomingEvents.stories"

const startProjectItems: LinkCard2ColumnProps = {
  buttonText: "Get started",
  buttonUrl: "#changeme",
  description:
    "Building on Flow is easy. Start building now with lorem ipsum et sigitus loranum prospitarius.",
  title: "Start Your Project",
  tags: ["Tutorial"],
  items: [
    {
      title: "Crypto Dappy Course",
      description:
        "A package used to interact with user wallets and the Flow blockchain.",
      href: "#",
      icon: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
    },
    {
      title: "Create an NFT",
      description:
        "A series of tutorials that explain how to build your first NFT (Non-Fungible Token)",
      icon: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
      links: [
        { href: "#", title: "Dictionaries" },
        { href: "#", title: "Path Finder for NFTs" },
      ],
    },
  ],
}

export default {
  component: HomePage,
  title: "Pages/HomePage",
} as Meta

const Template: Story<HomePageProps> = (args) => <HomePage {...args} />

const args: HomePageProps = {
  flips: {
    openFlips: DefaultFlips.args.openFlips,
    goodPlacesToStartFlips: DefaultFlips.args.goodPlacesToStartFlips,
  },
  upcomingEvents: DefaultUpcomingEvents.args,
}

export const Default = Template.bind({})
Default.args = args

export const dark = Template.bind({})
dark.args = args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const mobile = Template.bind({})
mobile.args = args
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

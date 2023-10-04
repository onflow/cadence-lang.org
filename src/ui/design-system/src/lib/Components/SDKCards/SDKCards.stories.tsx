import { Meta, Story } from "@storybook/react"
import { SDKCards, SDKCardsProps } from "."

export default {
  component: SDKCards,
  title: "Components/SDKCards",
  parameters: {
    layout: "centered",
  },
} as Meta

const Template: Story<SDKCardsProps> = (args) => {
  return <SDKCards {...args} />
}

export const Primary = Template.bind({})
Primary.args = {
  headerLink: "#",
  cards: [
    {
      title: "Flow Port",
      authorIcon: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
      authorName: "mini flow",
      tags: ["Tags"],
      link: "#",
      type: "sdk",
      stars: 52,
      lastCommit: "2022-03-22",
      lastRelease: "207",
    },
    {
      title: "Flow Port",
      authorIcon: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
      authorName: "mini flow",
      tags: ["Tags"],
      link: "#",
      type: "sdk",
      stars: 52,
      iconSrc: "https://avatars.githubusercontent.com/u/62387156?s=64&v=4",
      lastCommit: "2022-03-22",
      lastRelease: "207",
    },
  ],
}

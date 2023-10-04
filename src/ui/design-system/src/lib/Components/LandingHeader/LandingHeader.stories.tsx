import { Meta, Story } from "@storybook/react"
import { LandingHeader, LandingHeaderProps } from "."
// @ts-ignore
import LearnImage from "../../../../images/page/learn.png"
// @ts-ignore
import CommunityImage from "../../../../images/page/community.png"
// @ts-ignore
import ToolsImage from "../../../../images/page/tools.png"

export default {
  component: LandingHeader,
  title: "Components/LandingHeader",
  argTypes: {
    gradient: {
      options: [
        "community",
        "concepts",
        "getting-started",
        "home",
        "network",
        "tools",
      ],
      control: { type: "select" },
    },
  },
} as Meta

const Template: Story<LandingHeaderProps> = (args) => {
  return <LandingHeader {...args} />
}

export const Community = Template.bind({})
Community.args = {
  buttonText: "Button Text",
  buttonUrl: "#changeme",
  callout: "Featured callout here two lines",
  description:
    "Lorem ipsum dolor sit amet proin gravida lorem ipsum dolor sit.",
  title: "Community",
  imageSrc: CommunityImage,
}

export const GettingStarted = Template.bind({})
GettingStarted.args = {
  ...Community.args,
  title: "Getting Started",
  description:
    "Everything you need to start building on Flow verything you need to start building on Flow ever.",
}

export const Learn = Template.bind({})
Learn.args = {
  ...Community.args,
  title: "Learn",
  imageSrc: LearnImage,
}

export const Concepts = Template.bind({})
Concepts.args = {
  ...Community.args,
  title: "Concepts",
}

export const Tools = Template.bind({})
Tools.args = {
  ...Community.args,
  title: "Tools",
  imageSrc: ToolsImage,
}

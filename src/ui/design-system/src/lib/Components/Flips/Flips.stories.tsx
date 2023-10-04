import { Meta, Story } from "@storybook/react"
import { default as FlipCell, default as Flips, FlipsProps } from "."

export default {
  component: FlipCell,
  title: "Components/Flips",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<FlipsProps> = (args) => {
  return <Flips {...args} />
}

export const Default = Template.bind({})
const flip = {
  numComments: 23,
  heading: "Error Subscribing to Events in Default Docs",
  tags: ["moo", "crab", "rangoon"],
  participant: {
    profileImage:
      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    name: "Marky Mark",
  },
  date: "2022-05-16T18:46:23Z",
  forumLink: "#test",
}
const args = {
  openFlips: [flip, flip, flip],
  goodPlacesToStartFlips: [flip, flip, flip],
  headerLink: "#",
}
Default.args = args

export const dark = Template.bind({})
dark.args = Default.args
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

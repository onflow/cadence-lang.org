import { Meta, Story } from "@storybook/react"
import ForumCell, { ForumCellProps } from "."

export default {
  component: ForumCell,
  title: "Components/ForumCell",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<ForumCellProps> = (args) => {
  return <ForumCell {...args} />
}

export const Default = Template.bind({})
const args = {
  numComments: 23,
  heading: "Consensus Node Secrets Database",
  subheading: "Flow Javascript SDK",
  participants: [
    {
      profileImage:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      name: "Marky Mark",
    },
    {
      profileImage:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      name: "Marky Mark 2",
    },
    {
      profileImage:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      name: "Marky Mark 3",
    },
    {
      profileImage:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      name: "Marky Mark 4",
    },
  ],
  forumLink: "#test",
  lastUpdatedDate: "2022-06-06",
}

Default.args = args
export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

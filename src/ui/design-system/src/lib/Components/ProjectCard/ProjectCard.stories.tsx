import { Meta, Story } from "@storybook/react"
import ProjectCard, { ProjectCardProps } from "."

export default {
  component: ProjectCard,
  title: "Components/ProjectCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<ProjectCardProps> = (args) => <ProjectCard {...args} />

const args = {
  projectImage:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfixmqf_2CztGV3F0kD6nvX1CdruAwpIZd63mOUtJlhJ4VKQeq1n6uKyAk0B_x0rTomOc&usqp=CAU",
  heading: "Card containing everything",
  description:
    "Lorem ipsum text here can go a two liner sentence or a one liner",
  tags: ["Tool"],
  projectLink: "https://google.com",
  author: {
    name: "mini_flow",
    profileImage: "https://caneswarning.com/files/2012/12/68793261.jpg",
  },
  numStars: 52,
  twitterLink: "twitter.com",
  githubLink: "github.com",
}

export const Default = Template.bind({})
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

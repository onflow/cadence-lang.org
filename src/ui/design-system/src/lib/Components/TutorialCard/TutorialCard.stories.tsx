import { Meta, Story } from "@storybook/react"
import TutorialCard, { TutorialCardProps } from "."

export default {
  component: TutorialCard,
  title: "Components/TutorialCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<TutorialCardProps> = (args) => <TutorialCard {...args} />

const args = {
  heading: "This is a title with a header in a two line sentence",
  tags: ["Tool"],
  description: "An online contest that lorem ipsum ipsums ipsum",
  lastUpdated: "23/3/2022",
  level: "Beginners",
  imageUri:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/2560px-A_black_image.jpg",
  link: "/tutorials",
  author: {
    name: "Crab Rangoon",
  },
}

export const Primary = Template.bind({})
Primary.args = args

export const WithoutImage = Template.bind({})
let withoutImageArgs = { ...args }
// @ts-ignore
delete withoutImageArgs.imageUri
WithoutImage.args = withoutImageArgs

export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

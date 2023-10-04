import { Meta, Story } from "@storybook/react"
import RoundImage, { RoundImageProps } from "."

export default {
  component: RoundImage,
  title: "Components/RoundImage",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<RoundImageProps> = (args) => {
  return <RoundImage {...args} />
}

export const Primary = Template.bind({})
Primary.args = {
  imageUri:
    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  altText: "Github",
}

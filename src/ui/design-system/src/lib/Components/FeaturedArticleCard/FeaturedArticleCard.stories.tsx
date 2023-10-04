import { Meta, Story } from "@storybook/react"
import FeaturedArticleCard, { FeaturedArticleCardProps } from "."

export default {
  component: FeaturedArticleCard,
  title: "Components/FeaturedArticleCard",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<FeaturedArticleCardProps> = (args) => (
  <FeaturedArticleCard {...args} />
)

const args = {
  heading: "This is a featured article with two rows title",
  tags: ["Tag"],
  description:
    "Everything you need to start building on,  Flow verything you need to start building on start building on start building on",
  link: "/article",
  ctaText: "Click me!",
}

export const Primary = Template.bind({})
Primary.args = args

export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

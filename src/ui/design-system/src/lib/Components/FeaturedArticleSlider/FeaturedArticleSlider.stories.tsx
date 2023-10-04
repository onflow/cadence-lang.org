import { Meta, Story } from "@storybook/react"
import FeaturedArticleSlider, { FeaturedArticleSliderProps } from "."

export default {
  component: FeaturedArticleSlider,
  title: "Components/FeaturedArticleSlider",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<FeaturedArticleSliderProps> = (args) => {
  return <FeaturedArticleSlider {...args} />
}
const args = {
  headerLink: "#",
  articles: [
    {
      heading: "Node operator callout",
      description:
        "Everything you need to start building on Flow everything you need to start building on Flow everything you need to start building on Flow",
      ctaText: "Learn more",
      ctaLink: "https://google.com",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/2560px-A_black_image.jpg",
      imageAltText: "A random image",
    },
    {
      heading: "Node operator callout 2",
      description:
        "Everything you need to start building on Flow everything you need to start building on Flow everything you need to start building on Flow",
      ctaText: "Learn more",
      ctaLink: "https://google.com",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/2560px-A_black_image.jpg",
      imageAltText: "A random image",
    },
    {
      heading: "Node operator callout 3",
      description:
        "Everything you need to start building on Flow everything you need to start building on Flow everything you need to start building on Flow",
      ctaText: "Learn more",
      ctaLink: "https://google.com",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/2560px-A_black_image.jpg",
      imageAltText: "A random image",
    },
  ],
}

export const Default = Template.bind({})
Default.args = args

export const Mobile = Template.bind({})
Mobile.args = args
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

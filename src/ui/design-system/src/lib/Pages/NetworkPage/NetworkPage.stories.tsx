import { Meta, Story } from "@storybook/react"
import NetworkPage, { NetworkPageProps } from "."
import networkStatuses from "./sample"

export default {
  component: NetworkPage,
  title: "Pages/NetworkPage",
} as Meta

const Template: Story<NetworkPageProps> = (args) => <NetworkPage {...args} />
const args = {
  networkStatuses,

  featuredArticle: {
    heading: "Node operator callout",
    description:
      "Everything you need to start building on Flow verything you need to start building on Flow everything you need to start building on Flow",
    ctaText: "Learn more",
    ctaLink: "https://flow.com",
    imageUrl:
      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  },
}
export const Default = Template.bind({})
Default.args = args

export const mobile = Template.bind({})
mobile.args = Default.args
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

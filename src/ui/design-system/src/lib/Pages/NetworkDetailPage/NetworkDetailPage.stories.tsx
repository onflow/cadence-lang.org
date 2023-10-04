import { Meta, Story } from "@storybook/react"
import NetworkDetailPage, { NetworkDetailPageProps } from "."

export default {
  component: NetworkDetailPage,
  title: "Pages/NetworkDetailPage",
} as Meta

const Template: Story<NetworkDetailPageProps> = (args) => (
  <NetworkDetailPage {...args} />
)
const args = {
  networkName: "Mainnet",
  networkStatuses: [
    {
      id: "1",
      page_id: "",
      group_id: "",
      created_at: "",
      updated_at: "",
      group: true,
      name: "Mainnet",
      description: "",
      position: 0,
      status: "",
      showcase: true,
      only_show_if_degraded: false,
      automation_email: "",
      start_date: "",
    },
    {
      id: "2",
      page_id: "",
      group_id: "",
      created_at: "",
      updated_at: "",
      group: true,
      name: "Testnet",
      description: "",
      position: 0,
      status: "",
      showcase: true,
      only_show_if_degraded: false,
      automation_email: "",
      start_date: "",
    },
    {
      id: "3",
      page_id: "",
      group_id: "",
      created_at: "",
      updated_at: "",
      group: true,
      name: "Canarynet",
      description: "",
      position: 0,
      status: "",
      showcase: true,
      only_show_if_degraded: false,
      automation_email: "",
      start_date: "",
    },
  ],
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

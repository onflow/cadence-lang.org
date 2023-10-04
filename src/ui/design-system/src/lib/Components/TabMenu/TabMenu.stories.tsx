import { Meta, Story } from "@storybook/react"
import TabMenu, { TabMenuProps } from "."

export default {
  component: TabMenu,
  title: "Components/TabMenu",
} as Meta

const Template: Story<TabMenuProps> = (args) => <TabMenu {...args} />

export const Default = Template.bind({})
Default.args = {
  tabs: [{ name: "Mainnet" }, { name: "Testnet" }, { name: "Canary" }],
  onTabChange: () => null,
}

export const centered = Template.bind({})
centered.args = {
  ...Default.args,
  centered: true,
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const mobile = Template.bind({})
mobile.args = {
  tabs: [
    { name: "Mainnet" },
    { name: "Testnet" },
    { name: "Canary" },
    { name: "Foo" },
    { name: "Bar" },
  ],
}
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

export const withoutLinks = Template.bind({})
withoutLinks.args = {
  tabs: [
    { name: "Mainnet" },
    { name: "Testnet" },
    { name: "Canary" },
    { name: "Foo" },
    { name: "Bar" },
  ],
  onTabChange: undefined,
}

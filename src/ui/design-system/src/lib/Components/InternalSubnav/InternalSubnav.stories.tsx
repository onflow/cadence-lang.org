import { Meta, Story } from "@storybook/react"
import { InternalSubnav, InternalSubnavProps } from "."

const VERSIONS = [
  { name: "9.3", href: "#" },
  { name: "9.2", href: "#" },
  { name: "9.1", href: "#" },
  { name: "9.0", href: "#" },
  { name: "8.9", href: "#" },
  { name: "8.8", href: "#" },
]

export default {
  component: InternalSubnav,
  title: "Components/InternalSubnav",
} as Meta

const Template: Story<InternalSubnavProps> = (args) => (
  <InternalSubnav {...args} />
)

export const Default = Template.bind({})
Default.args = {
  items: [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Category",
      href: "#",
    },
    {
      name: "Page",
      href: "#",
    },
  ],
  versions: VERSIONS,
  selectedVersionName: VERSIONS[0].name,
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const mobile = Template.bind({})
mobile.args = { ...Default.args, current: "Quick reference 2: A longer title" }
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

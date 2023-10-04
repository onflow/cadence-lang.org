import { Meta, Story } from "@storybook/react"
import { InternalVersionSelect, InternalVersionSelectProps } from "."

export default {
  component: InternalVersionSelect,
  title: "Components/InternalVersionSelect",
} as Meta

const VERSIONS = [
  { name: "9.3", href: "#" },
  { name: "9.2", href: "#" },
  { name: "9.1", href: "#" },
  { name: "9.0", href: "#" },
  { name: "8.9", href: "#" },
  { name: "8.8", href: "#" },
]

const Template: Story<InternalVersionSelectProps> = (args) => {
  return <InternalVersionSelect {...args} />
}

export const Default = Template.bind({})
Default.args = {
  versions: VERSIONS,
  selectedVersionName: VERSIONS[0].name,
}

export const dark = Template.bind({})
dark.args = {
  versions: VERSIONS,
  selectedVersionName: VERSIONS[0].name,
}
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

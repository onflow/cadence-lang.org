import { Meta, Story } from "@storybook/react"
import { LandingHeaderHome, LandingHeaderHomeProps } from "."

export default {
  component: LandingHeaderHome,
  title: "Components/LandingHeaderHome",
  args: {
    gradient: "community",
  },
  argTypes: {
    gradient: {
      options: [
        "community",
        "concepts",
        "getting-started",
        "home",
        "network",
        "tools",
      ],
      control: { type: "select" },
    },
  },
} as Meta

const Template: Story<LandingHeaderHomeProps> = (args) => {
  return <LandingHeaderHome {...args} />
}

export const Default = Template.bind({})
Default.args = {
  title: "Developer Portal",
  description:
    "Understand the foundational concepts of Flow and it's language, Cadence",
  tag: "onflow",
}

export const DefaultMobile = Template.bind({})
DefaultMobile.args = Default.args
DefaultMobile.parameters = {
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

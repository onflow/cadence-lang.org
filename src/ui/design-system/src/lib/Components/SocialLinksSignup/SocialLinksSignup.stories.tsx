import { Meta, Story } from "@storybook/react"
import SocialLinksSignup, { SocialLinksSignupProps } from "."

export default {
  component: SocialLinksSignup,
  title: "Components/SocialLinksSignup",
} as Meta

const Template: Story<SocialLinksSignupProps> = (args) => {
  return <SocialLinksSignup {...args} />
}

export const Default = Template.bind({})
Default.args = {
  discordUrl: "https://onflow.org/discord",
  discourseUrl: "https://forum.onflow.org/",
  githubUrl: "https://github.com/onflow",
  twitterUrl: "https://twitter.com/flow_blockchain",
}

export const Mobile = Template.bind({})
Mobile.args = { ...Default.args }
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

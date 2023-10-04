import { Meta, Story } from "@storybook/react"
import { AnnouncementBanner } from "."
import AppLink from "../AppLink"

export default {
  component: AnnouncementBanner,
  title: "Components/AnnouncementBanner",
} as Meta

const Template: Story = (args) => {
  return (
    <AnnouncementBanner {...args}>
      <div>
        Permissionless deployment is coming to Flow! Read more{" "}
        <span style={{ textDecoration: "underline" }}>
          <AppLink to="https://permissionless.onflow.org/">here</AppLink>
        </span>
      </div>
    </AnnouncementBanner>
  )
}

export const Default = Template.bind({})

export const Mobile = Template.bind({})
Mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

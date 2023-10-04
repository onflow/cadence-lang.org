import { Meta, Story } from "@storybook/react"
import { ContentNavigationList, ContentNavigationListProps } from "."

export default {
  component: ContentNavigationList,
  title: "Components/ContentNavigationList",
} as Meta

const Template: Story<ContentNavigationListProps> = (args) => (
  <div className="bg-gray-300 dark:bg-black">
    <ContentNavigationList {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  header: "Explore more content",
  headerLink: "#",
  contentNavigationItems: [
    {
      title: "Learn",
      text: "All the resources you need to learn and build.",
      link: "/learn",
      icon: "learn",
    },
    {
      title: "Tools",
      text: "Curated list of developer tools, services, SDKs.",
      link: "/tools",
      icon: "tools",
    },
    {
      title: "Community",
      text: "Learn more about Flow's ecosystem and get involved.",
      link: "/community",
      icon: "community",
    },
    {
      title: "Bugs",
      text: "Learn more about Flow's ecosystem and get involved.",
      link: "#",
      icon: "bug",
    },
  ],
}

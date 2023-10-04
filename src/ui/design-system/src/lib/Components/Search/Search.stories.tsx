import { Story, Meta } from "@storybook/react"
import { Search, SearchProps } from "."

export default {
  component: Search,
  title: "Components/Search",
} as Meta

const Template: Story<SearchProps> = (args) => <Search {...args} />

export const Default = Template.bind({})
Default.args = {
  indexName: "default",
}

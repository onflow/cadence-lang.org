import { Meta, Story } from "@storybook/react"
import Pagination, { PaginationProps } from "."

export default {
  component: Pagination,
  title: "Components/Pagination",
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<PaginationProps> = (args) => <Pagination {...args} />

export const Default = Template.bind({})
Default.args = {
  itemCount: 100,
  pageSize: 4,
  page: 1,
  setPage: () => null,
}

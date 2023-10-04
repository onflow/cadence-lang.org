import { Meta, Story } from "@storybook/react"
import { FAQ, FAQProps } from "./FAQ"

export default {
  component: FAQ,
  title: "Components/FAQ",
} as Meta

const Template: Story<FAQProps> = (args) => <FAQ {...args} />

const faqList = [
  {
    question: "What is a spork",
    answer:
      "In the mature Flow, new nodes can be staked and un-staked as the protocol advances from epoch to epoch. However, we are not there yet. Hence, currently every couple of weeks we turn-off the network, update the identity list to include (and exclude) nodes and then turn the network back on again. We call this process a Spork.\n\nAlso, as Flow evolves, we are continuously adding new features and discovering and fixing bugs in the Flow node software. We also utilize a Spork as an opportunity to update the nodes with the latest releases.",
  },
  {
    question: "How frequently do we spork",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
  {
    question: "This is another question",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
  {
    question: "This is another question",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
]

export const Large = Template.bind({})
Large.args = {
  faqList,
  variation: "large",
}
export const Small = Template.bind({})
Small.args = {
  faqList,
  variation: "small",
}

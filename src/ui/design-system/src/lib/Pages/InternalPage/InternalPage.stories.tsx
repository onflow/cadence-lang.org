import { MemoryRouter } from "react-router"
import { Meta, Story } from "@storybook/react"
import { InternalPage, InternalPageProps } from "."

export default {
  component: InternalPage,
  title: "Pages/InternalPage",
  parameters: {
    layout: "padded",
    router: {
      disable: true,
    },
  },
} as Meta

const Template: Story<InternalPageProps> = (args) => {
  return (
    <MemoryRouter initialEntries={[`/${args.activePath}`]}>
      <InternalPage {...args} />
    </MemoryRouter>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  activePath: "internal/item2",
  repo: "foo",
  sidebatItems: [
    {
      title: "A section title",
      items: [
        {
          href: "internal/item1",
          title: "An item within a section",
        },
        {
          href: "internal/item2",
          title: "The active item",
        },
        {
          href: "internal/item3",
          title: "Another item",
        },
        {
          href: "internal/item4",
          title: "Blah blah blah",
        },
      ],
    },
  ],
  collectionDisplayName: "[Collection Title]",
  collectionRootPath: "/",
  children: "[Page content placeholder]",
} as InternalPageProps

export const PrimaryDark = Template.bind({})
PrimaryDark.args = { ...Primary.args }
PrimaryDark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const PrimaryMobile = Template.bind({})
PrimaryMobile.args = { ...Primary.args }
PrimaryMobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

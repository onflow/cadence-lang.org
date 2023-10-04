import { Meta, Story } from "@storybook/react"
import { ToggleButton, ToggleButtonProps } from "."

export default {
  component: ToggleButton,
  title: "Components/ToggleButton",
  args: {
    variant: "primary",
  },
  argTypes: {
    variant: {
      options: ["primary", "secondary"],
      control: { type: "select" },
    },
  },
  parameters: {
    layout: "padded",
  },
} as Meta

const Template: Story<ToggleButtonProps> = (args) => {
  return (
    <div
      style={{
        gap: "1rem",
        display: "inline-flex",
        flexDirection: "column",
      }}
    >
      <ToggleButton>Not selected</ToggleButton>
      <ToggleButton isSelected={true}>Selected</ToggleButton>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  children: "ToggleButton",
}
export const defaultDark = Template.bind({})
defaultDark.args = Default.args
defaultDark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

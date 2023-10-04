/* eslint-disable react/jsx-no-comment-textnodes */
import { Meta, Story } from "@storybook/react"
import { InternalCodeblock, InternalCodeblockProps } from "."

// TODO: prism-react-renderer's Highlight throws an error in story
export default {
  component: InternalCodeblock,
  title: "Components/InternalCodeblock",
} as Meta

const Template: Story<InternalCodeblockProps> = (args) => {
  return (
    <div
      style={{ maxWidth: 720, fontSize: 12, padding: "1rem" }}
      className="mdx-content"
    >
      <InternalCodeblock {...args}>
        <code
          className="language-cadence"
          style={{
            color: "#2f353f",
            direction: "ltr",
            hyphens: "none",
            lineHeight: 1.7,
            tabSize: 4,
            textAlign: "left",
            textShadow: "none",
            whiteSpace: "pre",
            wordBreak: "normal",
            wordSpacing: "normal",
          }}
        >
          <div style={{ color: "rgb(0, 128, 0)" }}>// Valid: title-case</div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>PersonID</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Valid: with underscore
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>token_name</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Valid: leading underscore and characters
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>_balance</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Valid: leading underscore and numbers
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>_8264</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Valid: characters and number
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>account2</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Invalid: leading number
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>1something</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Invalid: invalid character #
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>_#</div>
          <div style={{ color: "rgb(9, 136, 90)" }}>1</div>
          <div></div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>
            // Invalid: various invalid characters, Invalid: various invalid
            characters, Invalid: various invalid characters, Invalid: various
            invalid characters
          </div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>!@#$%^&amp;*</div>
          <div></div>
        </code>
      </InternalCodeblock>
      <br />
      <InternalCodeblock {...args}>
        <code
          className="language-cadence"
          style={{
            color: "#2f353f",
            direction: "ltr",
            hyphens: "none",
            lineHeight: 1.7,
            tabSize: 4,
            textAlign: "left",
            textShadow: "none",
            whiteSpace: "pre",
            wordBreak: "normal",
            wordSpacing: "normal",
          }}
        >
          <div style={{ color: "rgb(0, 128, 0)" }}>// Valid: title-case</div>
          <div></div>
          <div style={{ color: "rgb(0, 128, 0)" }}>//</div>
          <div></div>
          <div style={{ color: "rgb(0, 0, 0)" }}>PersonID</div>
        </code>
      </InternalCodeblock>
      <br />
      <code>Inline code</code>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  rawText: "Raw code",
  autoHeight: true,
}

export const DefaultDark = Template.bind({})
DefaultDark.args = { ...Default.args, theme: "dark" }
DefaultDark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const DefaultMobile = Template.bind({})
DefaultMobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}

export const Tall = Template.bind({})
Tall.args = {
  ...Default.args,
}

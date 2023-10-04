import DefaultImage from "../../../../images/misc/article-default.svg"
import CodeIcon from "../../../../images/content/code.svg"

export const TUTORIAL_CARD_ICONS = {
  default: DefaultImage,
  code: CodeIcon,
} as const

export type TutorialCardIconType = keyof typeof TUTORIAL_CARD_ICONS

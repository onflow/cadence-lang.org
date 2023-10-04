import CadenceLandingIcon from "../../../../images/tools/tool-cadence-landing.svg"
import FclIcon from "../../../../images/tools/tool-fcl.svg"
import MobileIcon from "../../../../images/tools/tool-mobile-landing.svg"

export const LANDING_HEADER_ICONS = {
  cadence: CadenceLandingIcon,
  "fcl-js": FclIcon,
  mobile: MobileIcon,
} as const

export type InternaLandingHeaderIconType = keyof typeof LANDING_HEADER_ICONS

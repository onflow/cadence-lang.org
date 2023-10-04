import clsx from "clsx"
import { InternaLandingHeaderIconType, LANDING_HEADER_ICONS } from "./icons"
import {
  InternalLandingHeaderCard,
  InternalLandingHeaderCardProps,
} from "./InternalLandingHeaderCard"

const TOOL_GRADIENT_CLASSES: Record<InternaLandingHeaderIconType, string> = {
  cadence: "tool-gradient-cadence",
  "fcl-js": "tool-gradient-fcl",
  mobile: "tool-gradient-mobile",
}

export type InternalLandingHeaderProps = {
  icon: InternaLandingHeaderIconType
  title: string
  description: string
  headerCards: InternalLandingHeaderCardProps[]
}

export function InternalLandingHeader({
  icon,
  title,
  description,
  headerCards,
}: InternalLandingHeaderProps) {
  const Icon = LANDING_HEADER_ICONS[icon]

  return (
    <div
      className={clsx(
        "flex min-h-[715px] flex-col items-center py-10 text-white",
        TOOL_GRADIENT_CLASSES[icon]
      )}
    >
      <div className="mb-14 flex max-w-[42rem] flex-col px-10 md:mb-4 md:items-center md:justify-center md:text-center">
        <div className="h-28 w-28 md:h-40 md:w-40">
          <Icon />
        </div>
        <h1 className="text-h2 mt-2 mb-4 text-white md:mt-10">{title}</h1>
        {description}
      </div>

      <div className="w-full">
        <div className="mx-auto max-w-[1220px] px-4 md:px-8">
          <div className="mb-4 hidden text-2xl font-bold md:block">
            Getting Started
          </div>
          <div className="flex flex-col gap-10 overflow-scroll md:flex-row">
            {headerCards.map((headerCard, index) => (
              <InternalLandingHeaderCard key={index} {...headerCard} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

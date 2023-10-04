import clsx from "clsx"
import { LowerPageNavLinkType } from "."
import ChevronLeft from "../../../../images/arrows/chevron-left.svg"
import ChevronRight from "../../../../images/arrows/chevron-right.svg"
import AppLink from "../AppLink"

export type LowerPageNavLinkProps = {
  link: LowerPageNavLinkType
  next?: boolean
}

export function LowerPageNavLink({ link, next }: LowerPageNavLinkProps) {
  return (
    <AppLink
      className={clsx(
        "group flex items-center rounded-lg p-4 hover:bg-primary-gray-50/50 dark:stroke-white dark:hover:bg-primary-gray-400/50 md:min-w-[17rem] md:p-5",
        {
          "justify-end border border-primary-gray-200 text-right dark:border-primary-gray-300":
            next,
        }
      )}
      to={link.href}
    >
      {!next && (
        <div className="mr-4">
          <ChevronLeft />
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <div className="text-primary-gray-300 dark:text-primary-gray-50">
          {next ? "Next" : "Prev"}
        </div>
        <div
          className={clsx("font-bold group-hover:text-primary-blue", {
            "text-black dark:text-white": next,
            "text-primary-gray-300 dark:text-primary-gray-50": !next,
          })}
        >
          {link.title}
        </div>
      </div>
      {next && (
        <div className="ml-4">
          <ChevronRight />
        </div>
      )}
    </AppLink>
  )
}

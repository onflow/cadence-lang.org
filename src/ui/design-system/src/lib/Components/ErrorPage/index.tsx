import clsx from "clsx"
import { ReactNode } from "react"

export const ErrorPage = ({
  title,
  subtitle,
  actions,
  className,
}: // padding = "pty",
{
  title: string
  subtitle: string | ReactNode
  /** e.g. a link to go back to a working state */
  actions: ReactNode
  isComponent?: boolean
  className?: string
}) => {
  const hasPadding = className?.includes("p-")
  return (
    <div
      className={clsx(
        className,
        "flex flex-1 flex-col",
        hasPadding || className?.includes("px-") ? "" : "px-12",
        hasPadding || className?.includes("py-") ? "" : "py-80"
      )}
    >
      <div className="px-auto flex max-w-3xl flex-col overflow-auto ">
        <div className="grid gap-2">
          <div className="font-extrabold text-red-error">{title}</div>
          <div>{subtitle}</div>
          <div>{actions}</div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import clsx from "clsx"
import Close from "../../../../images/action/close.svg"

export type ToggleButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  isSelected?: boolean
}

export function ToggleButton({
  className,
  children,
  isSelected = false,
  ...props
}: ToggleButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md border py-2 px-4 text-center text-base font-semibold hover:shadow-2xl",
        {
          "border-primary-gray-200 bg-transparent hover:bg-white dark:text-primary-gray-200 dark:hover:bg-primary-gray-400":
            !isSelected,
          "border-primary-blue bg-primary-blue text-white dark:border-blue-dark dark:bg-blue-dark dark:text-black dark:hover:shadow-2xl-dark":
            isSelected,
        },
        className
      )}
      {...props}
    >
      {children}
      <Close
        className={clsx("text-currentColor ml-2", {
          hidden: !isSelected,
        })}
        height="1.25em"
        width="1.25em"
        fill="currentColor"
      />
    </button>
  )
}

import clsx from "clsx"
import { MutableRefObject } from "react"
import DropdownArrowIcon from "../../../../images/misc/dropdown-arrow.svg"
import DropdownTransition from "./DropdownTransition"

export default function DropdownArrow({
  x,
  y,
  arrowRef,
  open,
}: {
  x?: number
  y?: number
  arrowRef: MutableRefObject<HTMLDivElement | null>
  open: boolean
}) {
  return (
    <div
      ref={arrowRef}
      style={{ top: y || 0, left: x || 0 }}
      className={clsx(
        "absolute ml-[-30px] mt-[-20px] text-white dark:text-primary-gray-dark",
        {
          hidden: !open,
        }
      )}
    >
      <DropdownTransition>
        <DropdownArrowIcon />
      </DropdownTransition>
    </div>
  )
}

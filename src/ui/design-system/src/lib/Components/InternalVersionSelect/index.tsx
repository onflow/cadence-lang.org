import { arrow, flip, useFloating } from "@floating-ui/react-dom"
import { Menu } from "@headlessui/react"
import clsx from "clsx"
import { Fragment, useRef } from "react"
import Check from "../../../../images/action/check.svg"
import ChevronDown from "../../../../images/arrows/chevron-down.svg"
import AppLink from "../AppLink"
import DropdownArrow from "../shared/DropdownArrow"
import DropdownTransition from "../shared/DropdownTransition"

export type Version = {
  name: string
  href: string
}

export type InternalVersionSelectProps = {
  selectedVersionName: string
  versions: Version[]
}

export function InternalVersionSelect({
  selectedVersionName,
  versions,
}: InternalVersionSelectProps) {
  const arrowRef = useRef(null)
  const {
    x,
    y,
    reference,
    floating,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    middleware: [arrow({ element: arrowRef }), flip()],
    placement: "bottom-end",
  })

  return (
    <div className="relative">
      <Menu>
        {({ open }) => (
          <div>
            <Menu.Button
              ref={reference}
              className="flex items-center py-2 pl-2 text-sm text-primary-gray-300 hover:text-primary-gray-400 dark:text-primary-gray-200 dark:hover:text-primary-gray-100"
            >
              Version {selectedVersionName}
              <div className="scale-75">
                <ChevronDown />
              </div>
            </Menu.Button>
            <div
              className="absolute mt-4 w-[12rem]"
              ref={floating}
              style={{ top: y || 0, left: x || 0 }}
            >
              <DropdownTransition>
                <Menu.Items className="relative max-h-[15rem] divide-y divide-solid divide-primary-gray-100 overflow-hidden overflow-y-auto rounded-lg bg-white shadow-2xl dark:divide-primary-gray-400 dark:hover:shadow-2xl-dark">
                  {versions.map((version) => {
                    const isSelected = selectedVersionName === version.name
                    return (
                      <Menu.Item as={Fragment} key={version.name}>
                        {({ active }) => (
                          <AppLink
                            to={version.href}
                            className={clsx(
                              "flex flex-1 flex-row items-center px-4 py-5 text-sm hover:text-primary-gray-400 dark:bg-primary-gray-dark dark:hover:text-primary-gray-100",
                              isSelected
                                ? "text-primary-gray-400 dark:text-primary-gray-100"
                                : "text-primary-gray-300 dark:text-primary-gray-200",
                              {
                                "bg-primary-gray-50 dark:bg-primary-gray-400":
                                  active,
                              }
                            )}
                          >
                            Version {version.name}
                            {isSelected && (
                              <div className="ml-auto scale-75 text-primary-green dark:text-green-dark">
                                <Check />
                              </div>
                            )}
                          </AppLink>
                        )}
                      </Menu.Item>
                    )
                  })}
                </Menu.Items>
              </DropdownTransition>
              <DropdownArrow
                arrowRef={arrowRef}
                x={arrowX}
                y={arrowY}
                open={open}
              />
            </div>
          </div>
        )}
      </Menu>
    </div>
  )
}

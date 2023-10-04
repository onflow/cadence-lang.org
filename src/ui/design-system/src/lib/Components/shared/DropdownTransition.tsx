import { Transition } from "@headlessui/react"
import React from "react"

export default function DropdownTransition({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Transition
      enter="transition duration-150 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-100 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
    >
      {children}
    </Transition>
  )
}

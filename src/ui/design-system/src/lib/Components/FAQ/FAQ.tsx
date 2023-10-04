import { useState } from "react"
import clsx from "clsx"

import ChevronRight from "../../../../images/arrows/chevron-right.svg"
import ChevronDown from "../../../../images/arrows/chevron-down.svg"

export interface IFAQ {
  question: string
  answer: string
}

export interface FAQProps {
  faqList: IFAQ[]
  variation: "large" | "small"
}

export function FAQ({ faqList, variation }: FAQProps) {
  const [expanded, setExpanded] = useState(
    new Array(faqList.length).fill(false)
  )

  const toggleExpansion = (index: number) => {
    const newExpanded = [...expanded]
    newExpanded[index] = !newExpanded[index]
    setExpanded(newExpanded)
  }

  return (
    <div className="dark:bg-black">
      {faqList.map((faq, i) => {
        const itemExpanded = expanded[i]
        const isAboveExpandedItem = expanded.at(i + 1)
        const isLast = i === expanded.length - 1

        const classes = clsx("cursor-pointer", {
          "md:p-8": variation === "large" && !itemExpanded,
          "md:py-4 md:pl-3": variation === "small" && !itemExpanded,
          "py-3 pr-3": !itemExpanded,
          "px-6 py-7 pt-6 my-1.5 rounded-lg bg-white dark:bg-primary-gray-dark":
            itemExpanded,
          "border-b border-gray-200 dark:border-primary-gray-400":
            !itemExpanded && !isLast && !isAboveExpandedItem,
        })

        return (
          <div
            onClick={() => toggleExpansion(i)}
            role="button"
            className={classes}
            key={i}
          >
            <div
              className={`flex items-center justify-between gap-4 ${
                itemExpanded ? "pb-3" : ""
              }`}
            >
              <div
                className={`${
                  itemExpanded
                    ? "text-2xl font-semibold"
                    : "text-base dark:text-primary-gray-100"
                } ${
                  variation === "large" ? "md:text-2xl md:font-semibold" : ""
                }`}
              >
                {faq.question}
              </div>
              <div className="text-gray-800 dark:text-primary-gray-100">
                {itemExpanded ? <ChevronDown /> : <ChevronRight />}
              </div>
            </div>
            {itemExpanded && (
              <div className="whitespace-pre-wrap text-gray-700 dark:text-primary-gray-200">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

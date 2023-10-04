import clsx from "clsx"
import { Highlight, Snippet } from "react-instantsearch-hooks-web"
import ChevronRightIcon from "../../../../images/arrows/chevron-right.svg"
import DocumentIcon from "../../../../images/content/document.svg"
import ExternalIcon from "../../../../images/content/external-link-square.svg"
import { HitType } from "./Autocomplete"

export function Item({ item, selected }: { item: HitType; selected: boolean }) {
  return (
    <a
      className={clsx(
        "flex flex-1 items-center rounded-lg py-4 px-4 focus:bg-primary-gray-50 dark:text-white focus:dark:bg-primary-gray-dark md:p-6 md:pl-4",
        {
          "bg-primary-gray-50 dark:bg-primary-gray-dark": selected,
        }
      )}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      role="option"
      aria-selected="false"
    >
      <div className="mr-1 scale-50 text-primary-gray-300 md:mr-5 md:scale-100">
        {item.depth > 1 ? <ExternalIcon /> : <DocumentIcon />}
      </div>
      <div className="flex flex-col text-sm md:text-base">
        <div className="font-semibold">
          {/* @ts-expect-error */}
          <Highlight hit={item} attribute="title" />
        </div>
        <Snippet
          attribute="headers"
          // @ts-expect-error: TODO: Short description of the error
          hit={item}
          className="break-all text-primary-gray-300 dark:text-primary-gray-200"
        />
        <Snippet
          attribute="content"
          // @ts-expect-error: TODO: Short description of the error
          hit={item}
          className="break-all text-primary-gray-200 dark:text-primary-gray-200"
        />
      </div>
      <div className="ml-auto">
        <ChevronRightIcon />
      </div>
    </a>
  )
}

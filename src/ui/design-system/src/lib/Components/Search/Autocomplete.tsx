import {
  AutocompleteState,
  BaseItem,
  createAutocomplete,
} from "@algolia/autocomplete-core"
import { getAlgoliaResults } from "@algolia/autocomplete-js"
import { SearchClient } from "algoliasearch/lite"
import clsx from "clsx"
import { KeyboardEvent, useMemo, useRef, useState } from "react"
import SearchIcon from "../../../../images/action/search.svg"
import { Panel } from "./Panel"

export type SearchProps = {
  appId: string
  apiKey: string
  indexName: string
}

export type HitType = BaseItem & {
  url: string
  title: string
  headers: string[]
  depth: number
}

export function Autocomplete({
  searchClient,
  indexName,
  closeDialog,
}: {
  searchClient: SearchClient
  indexName: string
  closeDialog: () => void
}) {
  const [autocompleteState, setAutocompleteState] =
    useState<AutocompleteState<HitType>>()
  const inputRef = useRef(null)

  const autocomplete = useMemo(
    () =>
      createAutocomplete<HitType, Event, MouseEvent, globalThis.KeyboardEvent>({
        autoFocus: true,
        defaultActiveItemId: 0,
        detachedMediaQuery: "",
        // @ts-expect-error
        getSources() {
          return [
            {
              sourceId: indexName,
              getItemInputValue({ item }) {
                return item.query
              },
              getItems({ query }) {
                return getAlgoliaResults({
                  searchClient,
                  queries: [
                    {
                      indexName: indexName,
                      query,
                      params: {
                        hitsPerPage: 10,
                        highlightPreTag: "<mark>",
                        highlightPostTag: "</mark>",
                      },
                    },
                  ],
                })
              },
              getItemUrl({ item }) {
                return item.url
              },
            },
          ]
        },
        onStateChange({ state }) {
          setAutocompleteState(state)
        },
      }),
    [indexName, searchClient]
  )
  const inputProps = autocomplete.getInputProps({
    inputElement: inputRef.current,
  })
  const showResults = !!autocompleteState && autocompleteState.query.length > 0

  return (
    <div
      className="h-full rounded-md"
      {...autocomplete.getRootProps({})}
      style={{ maxWidth: "80vw" }}
    >
      {/* @ts-expect-error */}
      <form
        className="relative flex h-full flex-col"
        {...autocomplete.getFormProps({
          inputElement: inputRef.current,
          onKeyDown: (e: KeyboardEvent<HTMLImageElement>) => {
            // This prevents the autocomplete search popup from closing
            // when the enter key is pressed if there are no search results.
            if (
              e.key === "Enter" &&
              autocompleteState?.collections?.[0]?.items.length === 0
            ) {
              e.preventDefault()
            }
          },
        })}
      >
        <button onClick={closeDialog} className="absolute h-full w-full" />
        <div className="relative flex min-h-0 items-center">
          <div className="absolute left-5 z-20 scale-75 dark:text-blue-hover-dark">
            <SearchIcon />
          </div>
          {/* @ts-expect-error */}
          <input
            className={clsx(
              "z-10 h-16 w-full rounded-md border-transparent bg-white px-14 pt-4 pb-3 text-base text-black !ring-0 focus:border-transparent dark:border-blue-hover-dark dark:bg-black dark:text-white",
              {
                "rounded-b-none": showResults,
              }
            )}
            ref={inputRef}
            {...inputProps}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Escape") {
                closeDialog()
                return
              }
              // @ts-expect-error: TODO: Short description of the error
              inputProps.onKeyDown(e)
            }}
            type="text"
            placeholder="Search documentation..."
          />
          <button
            onClick={closeDialog}
            className="absolute right-5 z-10 text-primary-gray-300 hover:opacity-75 dark:text-primary-gray-200"
          >
            ESC
          </button>
        </div>
        {showResults && (
          <Panel
            autocomplete={autocomplete}
            autocompleteState={autocompleteState}
          />
        )}
      </form>
    </div>
  )
}

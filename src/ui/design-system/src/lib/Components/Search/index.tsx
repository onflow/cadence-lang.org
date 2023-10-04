import algoliasearch from "algoliasearch/lite"
import { useCallback, useEffect, useMemo, useState } from "react"
import { InstantSearch } from "react-instantsearch-hooks-web"
import SearchIcon from "../../../../images/action/search.svg"
import { Dialog } from "../Dialog"
import { Autocomplete } from "./Autocomplete"
import KbdShortcut from "./KbdShortcut"

export type SearchProps = {
  appId: string
  apiKey: string
  indexName: string
}

function KbdShortcuts() {
  return (
    <div className="-mt-1 flex flex-grow-0 items-center">
      <KbdShortcut>
        <span className="flex h-full items-center justify-center text-lg">
          ⌘
        </span>
      </KbdShortcut>
      <KbdShortcut>
        <span className="-mt-[1px] flex h-full items-center justify-center text-sm">
          K
        </span>
      </KbdShortcut>
    </div>
  )
}

export function Search({ appId, apiKey, indexName }: SearchProps) {
  const [open, setOpen] = useState(false)
  const closeDialog = () => setOpen(false)
  const searchClient = useMemo(
    () => algoliasearch(appId, apiKey),
    [apiKey, appId]
  )

  const onKeyDown = useCallback(({ repeat, metaKey, ctrlKey, key }) => {
    if (repeat) return
    // Open search dialog with cmd+k or ctrl+k
    if ((metaKey || ctrlKey) && key === "k") setOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [onKeyDown])

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center hover:text-primary-blue dark:hover:text-blue-hover-dark"
      >
        <div className="mr-1 scale-75">
          <SearchIcon />
        </div>
        Search
        <div className="hidden md:ml-3 md:flex">
          <KbdShortcuts />
        </div>
      </button>
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <Dialog open={open} closeDialog={closeDialog} maxWidth="695px">
          <Autocomplete
            searchClient={searchClient}
            indexName={indexName}
            closeDialog={closeDialog}
          />
        </Dialog>
      </InstantSearch>
    </>
  )
}

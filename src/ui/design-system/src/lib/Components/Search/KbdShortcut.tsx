import React from "react"

export type SearchProps = {
  appId: string
  apiKey: string
  indexName: string
}

export default function KbdShortcut({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <kbd className="to-gray-300-opacity-60 mr-1 flex h-6 w-6 items-center justify-center rounded border-b-2 border-gray-200 bg-gradient-to-tl from-gray-200 text-gray-500/75 group-hover:opacity-75 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-gray-400">
      <div
        className="flex h-full w-full items-center justify-center rounded border-t border-l border-r border-white leading-none dark:border-gray-400"
        style={{
          boxShadow:
            "0 4px 11px 0 rgb(37 44 97 / 15%), 0 1px 3px 0 rgb(93 100 148 / 60%)",
        }}
      >
        {children}
      </div>
    </kbd>
  )
}

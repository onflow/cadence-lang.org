import clsx from "clsx"
import { useCallback, useRef, useState } from "react"
import { SidebarItem } from "../../Components/InternalSidebar"
import { useActiveSidebarItems } from "../../Components/InternalSidebar/useActiveSidebarItems"
import {
  InternalToc,
  InternalTocDisclosure,
  InternalTocItem,
} from "../../Components/InternalToc"
import { LowerPageNav } from "../../Components/LowerPageNav"
import {
  useResizeObserver,
  UseResizeObserverCallback,
} from "../../utils/useResizeObserver"
import { useProvideInternalPageEditUrl } from "./InternalPageEditUrlContext"

export type InternalPageContentProps = React.PropsWithChildren<{
  editPageUrl?: string

  /**
   * The configuration object that describes the page hierarchy.
   */
  sidebarItems?: SidebarItem[]

  toc?: InternalTocItem[]
}>

export function InternalPageContent({
  children,
  editPageUrl,
  sidebarItems,
  toc,
}: InternalPageContentProps) {
  useProvideInternalPageEditUrl(editPageUrl)
  const { previous, next } = useActiveSidebarItems(sidebarItems || [], true)
  const subnavRef = useRef<HTMLDivElement>(null)
  const [subnavRect, setSubnavRect] = useState<DOMRect>()
  const resizeObserverCallback = useCallback<UseResizeObserverCallback>(() => {
    setSubnavRect(subnavRef.current?.getBoundingClientRect())
  }, [subnavRef, setSubnavRect])
  useResizeObserver(subnavRef, resizeObserverCallback)

  return (
    <main
      className={clsx(
        "flex max-w-full shrink-0 grow flex-row-reverse justify-center",
        {
          "md:max-w-[calc(100%_-_240px)] lg:max-w-[calc(100%_-_300px)]":
            sidebarItems,
        }
      )}
    >
      {toc && (
        <div className="hidden flex-none md:flex md:w-1/4">
          <div
            className="sticky h-full max-h-screen overflow-auto py-8 pr-8 lg:p-8"
            style={{
              top: subnavRect?.height ?? 0,
              maxHeight: `calc(100vh - ${subnavRect?.bottom ?? 0}px)`,
            }}
          >
            <InternalToc headings={toc} />
          </div>
        </div>
      )}
      <div
        className={clsx("w-full flex-none p-8 pb-80", {
          "md:w-3/4 md:max-w-[730px] md:pl-12 xl:max-w-[50%] xl:max-w-[830px] xl:pl-0":
            !!toc,
        })}
      >
        {toc && (
          <div className="mb-8 md:mb-0 md:hidden">
            <InternalTocDisclosure headings={toc} />
          </div>
        )}
        <div>{children}</div>
        <LowerPageNav prev={previous} next={next} />
      </div>
    </main>
  )
}

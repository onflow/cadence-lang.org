import { Transition } from "@headlessui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import {
  InternalLandingHeader,
  InternalLandingHeaderProps,
} from "../../Components/InternalLandingHeader"
import { InternalSidebar, SidebarItem } from "../../Components/InternalSidebar"
import { useActiveSidebarItems } from "../../Components/InternalSidebar/useActiveSidebarItems"
import { InternaSidebarDropdownMenuGroup } from "../../Components/InternalSidebarDropdownMenu"
import { InternalSubnav } from "../../Components/InternalSubnav"
import { MobileMenuToggleButton } from "../../Components/NavigationBar/MobileMenuToggleButton"
import {
  useResizeObserver,
  UseResizeObserverCallback,
} from "../../utils/useResizeObserver"
import { InternalPageEditUrlContext } from "./InternalPageEditUrlContext"
import {
  useInternalBreadcrumbs,
  UseInternalBreadcrumbsOptions,
} from "./useInternalBreadcrumbs"

export type InternalPageContainerProps = React.PropsWithChildren<{
  additionalBreadrumbs?: UseInternalBreadcrumbsOptions["additionalitems"]

  /**
   * THe name to display in the breadcrumbs for the current collection
   */
  collectionDisplayName: string

  /**
   * The root path for the current collection
   */
  collectionRootPath: string

  header?: InternalLandingHeaderProps

  /**
   * The itmes to show in the dropdown menu of the sidebar.
   */
  sidebarDropdownMenu?: InternaSidebarDropdownMenuGroup[]

  /**
   * The configuration object that describes the page hierarchy.
   */
  sidebarItems?: SidebarItem[]

  /**
   * Any errors with the configuration in the remote repo to display
   */
  remoteRepoError?: string
}>

export function InternalPageContainer({
  additionalBreadrumbs,
  children,
  collectionDisplayName,
  collectionRootPath,
  // editPageUrl,
  header,
  sidebarDropdownMenu,
  sidebarItems,
  remoteRepoError,
}: InternalPageContainerProps) {
  const [editPageUrl, setEditPageUrl] = useState<string | undefined>(undefined)
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { active } = useActiveSidebarItems(sidebarItems || [])
  const breadcrumbs = useInternalBreadcrumbs({
    activeItem: active,
    additionalitems: additionalBreadrumbs,
    collectionDisplayName,
    collectionRootPath,
  })

  const subnavRef = useRef<HTMLDivElement>(null)
  const [subnavRect, setSubnavRect] = useState<DOMRect>()
  const resizeObserverCallback = useCallback<UseResizeObserverCallback>(() => {
    setSubnavRect(subnavRef.current?.getBoundingClientRect())
  }, [subnavRef, setSubnavRect])
  useResizeObserver(subnavRef, resizeObserverCallback)

  const contentRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (contentRef.current && !header) {
      // Only scroll on pages without a header.
      contentRef.current.scrollIntoView(true)
    }
  }, [pathname, header])

  return (
    <InternalPageEditUrlContext.Provider
      value={{ value: editPageUrl, setValue: setEditPageUrl }}
    >
      <div className="flex flex-col pb-16" ref={contentRef}>
        <div
          className="sticky top-0 z-20 bg-white dark:bg-black"
          ref={subnavRef}
        >
          <InternalSubnav
            isSidebarOpen={isMobileSidebarOpen}
            onSidebarToggle={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
            items={breadcrumbs}
            editPageUrl={editPageUrl}
          />
        </div>
        {header && <InternalLandingHeader {...header} />}
        {sidebarItems && (
          <Transition
            as="div"
            className="fixed bottom-0 left-0 right-0 z-40 overflow-y-scroll bg-white dark:bg-black md:hidden"
            style={{
              top: subnavRect ? subnavRect.top : 0,
            }}
            show={isMobileSidebarOpen}
            enter="transform transition duration-300 ease-in-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform duration-300 transition ease-in-out"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="mb-2 border-b border-b-primary-gray-100 px-6 pt-1 pb-2 dark:border-b-primary-gray-300">
              <MobileMenuToggleButton
                className="mr-4 md:hidden"
                height="20px"
                isOpen
                onOpenChanged={() => setMobileSidebarOpen(false)}
              />
            </div>
            <div className="p-6">
              <InternalSidebar
                items={sidebarItems}
                menu={sidebarDropdownMenu}
              />
            </div>
          </Transition>
        )}

        <div className="relative flex flex-1">
          {sidebarItems && (
            <>
              <aside className="hidden w-[240px] flex-none bg-primary-gray-50 dark:bg-primary-gray-dark md:block lg:w-[300px]">
                <div
                  className="sticky h-full max-h-screen overflow-auto p-8"
                  style={{
                    top: subnavRect?.height ?? 0,
                    maxHeight: `calc(100vh - ${subnavRect?.bottom ?? 0}px)`,
                  }}
                >
                  <InternalSidebar
                    items={sidebarItems}
                    menu={sidebarDropdownMenu}
                  />
                </div>
              </aside>
            </>
          )}
          {children}
        </div>
      </div>
    </InternalPageEditUrlContext.Provider>
  )
}

import ChevronRight from "../../../../images/arrows/chevron-right.svg"
import AppLink from "../AppLink"
import { useResolvedSidebarUrl } from "../InternalSidebar/useResolvedSidebarUrl"
import Tag from "../Tag"

export type InternalLandingHeaderCardProps = {
  title: string
  tags: string[]
  description: string
  href: string
}

export function InternalLandingHeaderCard({
  title,
  tags,
  description,
  href,
}: InternalLandingHeaderCardProps) {
  const resolvedHref = useResolvedSidebarUrl(href)
  return (
    <AppLink
      className="group flex min-h-[9rem] flex-1 flex-row rounded-2xl bg-white px-6 py-5 dark:bg-black"
      to={resolvedHref}
    >
      <div className="pr-2">
        <div className="flex flex-col md:flex-col-reverse">
          <div className="mb-2 md:mb-0">
            {tags.map((tag) => (
              <Tag name={tag} key={tag} />
            ))}
          </div>
          <div className="text-semibold text-xl text-black group-hover:opacity-75 dark:text-white">
            {title}
          </div>
        </div>
        <div className="mt-2 text-sm text-primary-gray-300 dark:text-primary-gray-200">
          {description}
        </div>
      </div>
      <div className="ml-auto mt-7 text-black group-hover:opacity-75 dark:text-white">
        <ChevronRight />
      </div>
    </AppLink>
  )
}

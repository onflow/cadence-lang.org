import ChevronRight from "../../../../images/arrows/chevron-right.svg"
import ExternalLinkIcon from "../../../../images/content/external-link.svg"
import AppLink from "../AppLink"
import { ButtonLink } from "../Button"
import { isLinkExternal } from "../../utils/isLinkExternal"

export type FeatureLinkBlockProps = {
  ctaLink: string
  ctaText: string
  description: string
  iconSrc: string
  links: Array<{
    href: string
    title: string
  }>
  title: string
}

export function FeatureLinkBlock({
  ctaLink = "Online",
  ctaText,
  description,
  iconSrc,
  links,
  title,
}: FeatureLinkBlockProps) {
  return (
    <div className="flex flex-col items-stretch rounded-lg bg-white p-6 dark:bg-primary-gray-dark md:flex-row md:items-center md:p-12">
      <div className="basis-1/2 md:mr-10">
        <div>
          <img src={iconSrc} alt={title} className="max-h-[100px]" />
        </div>
        <h2 className="text-h2 mt-6 mb-2">{title}</h2>
        <p className="mb-10 text-primary-gray-400 dark:text-primary-gray-100">
          {description}
        </p>
        <ButtonLink
          href={ctaLink}
          className="whitespace-nowrap px-8 py-3 text-center"
        >
          {ctaText}
        </ButtonLink>
      </div>
      <div className="mt-10 flex basis-1/2 flex-col items-stretch divide-y divide-primary-gray-100 dark:divide-primary-gray-400">
        {links.map(({ title, href }, index) => (
          <AppLink
            className="flex items-center justify-between py-3 text-sm text-primary-blue hover:opacity-75 dark:text-blue-dark"
            key={index}
            to={href}
          >
            <span>{title}</span>
            {isLinkExternal(href) ? <ExternalLinkIcon /> : <ChevronRight />}
          </AppLink>
        ))}
      </div>
    </div>
  )
}

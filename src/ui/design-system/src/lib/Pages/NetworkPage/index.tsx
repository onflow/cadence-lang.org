import React from 'react'
import {
  NetworkCard,
  // NetworkDiscordCard,
  SocialLinksSignup,
} from '../../Components'
import { type AnnouncementCardProps } from '../../Components/AnnouncementCard'
import { FeaturedArticle } from '../../Components/FeaturedArticleSlider'
// import { HeaderWithLink } from "../../Components/HeaderWithLink"
import { type NetworkDiscordCardProps } from '../../Components/NetworkDiscordCard'
import { type SocialLinksSignupProps } from '../../Components/SocialLinksSignup'
import { type Article } from '../../interfaces'
import { dateYYYYMMDD } from '../../utils/dates'
import PageBackground from '../shared/PageBackground'
import PageSection from '../shared/PageSection'
import PageSections from '../shared/PageSections'

export type NetworkPageProps = SocialLinksSignupProps & {
  announcementCards?: AnnouncementCardProps[]
  discordNetworkCards?: NetworkDiscordCardProps[]
  featuredArticle: Article
  networks: Array<{
    id: string
    lastSporkDate?: string
    link: string
    name: string
    status?: string
  }>
}

const NetworkPage = ({
  discordUrl,
  discourseUrl,
  featuredArticle,
  githubUrl,
  networks,
  twitterUrl,
}: NetworkPageProps): JSX.Element => (
  <PageBackground gradient="network">
    <PageSections divided={false}>
      <PageSection>
        <div className="container">
          <h1 className="text-h1 pt-28 md:pt-[212px]">Network status</h1>
          <div className="mt-20 flex flex-col gap-4 md:gap-6">
            {networks.map(({id, name, lastSporkDate, link, status }) => (
              <div key={id}>
                <NetworkCard
                  networkName={name}
                  status={
                    status === 'operational' ? 'Healthy' : 'Under Maintenance'
                  }
                  version="33"
                  lastSporkDate={
                    lastSporkDate != null && Boolean(lastSporkDate) ? dateYYYYMMDD(lastSporkDate) : ''
                  }
                  nextSporkDate="TBD"
                  link={link}
                />
              </div>
            ))}
          </div>
        </div>
      </PageSection>
      {/* <PageSection sectionId="live-updates">
        <div className="container">
          <HeaderWithLink headerLink="live-updates" className="mb-10 text-h3">
            Live updates
          </HeaderWithLink>
          <div className="flex flex-col gap-4 mt-6 md:flex-row md:gap-8">
            {discordNetworkCards.map((discordNetworkCards) => (
              <div key={discordNetworkCards.messageLink}>
                <NetworkDiscordCard {...discordNetworkCards} />
              </div>
            ))}
          </div>
        </div>
      </PageSection>
      <PageSection sectionId="announcements">
        <div className="container">
          <HeaderWithLink headerLink="announcements" className="mb-6 text-h3">
            Announcements
          </HeaderWithLink>
          <div className="flex flex-col gap-4 md:gap-8">
            {announcementCards.map((announcementCardProps) => (
              <div key={announcementCardProps.link}>
                <AnnouncementCard {...announcementCardProps} />
              </div>
            ))}
          </div>
        </div>
      </PageSection> */}
      <PageSection>
        <div className="container">
          <FeaturedArticle {...featuredArticle} />
        </div>
      </PageSection>
    </PageSections>
    <SocialLinksSignup
      discordUrl={discordUrl}
      discourseUrl={discourseUrl}
      githubUrl={githubUrl}
      twitterUrl={twitterUrl}
    />
  </PageBackground>
)

export default NetworkPage

import React from 'react'
import { endOfWeek } from 'date-fns'
import ChevronLeftIcon from '../../../../images/arrows/chevron-left.svg'
import {
  NetworkDetailsCard,
  Pagination,
  SocialLinksSignup,
  SporksCard,
  // TabMenu,
} from '../../Components'
import AppLink from '../../Components/AppLink'
import { FeaturedArticle } from '../../Components/FeaturedArticleSlider'
import { HeaderWithLink } from '../../Components/HeaderWithLink'
import { type SporksCardProps } from '../../Components/SporksCard'
import { type Article, type StatuspageApiResponse } from '../../interfaces'
import PageBackground from '../shared/PageBackground'
import PageSection from '../shared/PageSection'
import PageSections from '../shared/PageSections'
import { dateYYYYMMDD } from '../../utils/dates'
import { type SocialLinksSignupProps } from '../../Components/SocialLinksSignup'

export type NetworkDetailPageProps = SocialLinksSignupProps & {
  featuredArticle: Article
  networkName: string
  status?: StatuspageApiResponse
  pastSporks: SporksCardProps[]
  networks: Array<{
    link: string
    name: string
  }>
}

const NetworkDetailPage = ({
  discordUrl,
  discourseUrl,
  featuredArticle,
  githubUrl,
  networkName,
  networks,
  pastSporks,
  // status,
  twitterUrl,
}: NetworkDetailPageProps): JSX.Element => {
  return (
    <PageBackground>
      <PageSections divided={false}>
        <PageSection>
          <div className="container relative">
            <AppLink
              to="/network"
              className="absolute top-[110px] right-0 flex max-w-fit text-primary-blue hover:opacity-75 dark:text-blue-dark md:right-auto md:top-0 md:left-0 md:py-6"
            >
              <ChevronLeftIcon /> Network
            </AppLink>
          </div>
          {/* <TabMenu tabs={networks} centered /> */}
          <div className="text-h3 md:text-h1 mt-16 mb-14 pl-4 md:text-center md:text-5xl">
            {networkName}
          </div>
          <NetworkDetailsCard
            // status={
            //   status?.status === 'operational' ? 'Healthy' : 'Under Maintenance'
            // }
            statusLink="https://status.onflow.org"
            version="33"
            lastSporkDate={
              Boolean(pastSporks[0]) && pastSporks[0] != null ? dateYYYYMMDD(pastSporks[0].timestamp) : 'N/A'
            }
            nextSporkDate="TBD"
          />
        </PageSection>
        <PageSection sectionId="upcoming-spork">
          <div className="container">
            <HeaderWithLink
              headerLink="upcoming-spork"
              className="text-h2 xs:font-md mb-8"
            >
              Upcoming Spork
            </HeaderWithLink>
            <SporksCard
              heading={networkName}
              timestamp={endOfWeek(new Date()).toString()}
              sporkMetadata={{
                accessNode: 'access-001.mainnet15.nodes.onflow.org:9000',
                date: new Date().toString(),
                rootHeight: '19050753',
                rootParentId:
                  'ac4dbf344ce96e39e15081f1dc3fbbf6dc80532e402de9a57af847d3b35df596',
                rootStateCommit:
                  '641eb088e3ce1a01ff56df2d3a14372c65a7fef44c08799eb92cd7759d1d1d2a',
                gitCommit: 'f019c1dbd778ce9f92dea61349ca36003678a9ad',
              }}
              upcoming
            />
          </div>
        </PageSection>
        <PageSection sectionId="past-sporks">
          <div className="container">
            <HeaderWithLink
              headerLink="past-sporks"
              className="text-h4 xs:font-md mb-8"
            >
              Past Sporks
            </HeaderWithLink>
            <div className="mb-4 divide-y dark:divide-primary-gray-400">
              {pastSporks.map((spork, index) => (
                <div className="divided-item-hover" key={index}>
                  <SporksCard {...spork} />
                </div>
              ))}
            </div>
            <Pagination
              itemCount={40}
              pageSize={4}
              page={1}
              setPage={() => null}
            />
          </div>
        </PageSection>
        <PageSection>
          <div className="container">
            <div className="self-center">
              <FeaturedArticle {...featuredArticle} />
            </div>
          </div>
        </PageSection>
        {/* <PageSection>
          <div className="container">
            <Callout
              heading="Spork FAQ"
              description="Lorem ipsum dolor sit amet proin gravida lorem ipsum"
              ctaText="View FAQ"
              ctaLink="https://flow.com"
            />
          </div>
        </PageSection> */}
      </PageSections>
      <SocialLinksSignup
        discordUrl={discordUrl}
        discourseUrl={discourseUrl}
        githubUrl={githubUrl}
        twitterUrl={twitterUrl}
      />
    </PageBackground>
  )
}

export default NetworkDetailPage

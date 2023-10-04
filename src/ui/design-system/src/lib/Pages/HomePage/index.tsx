import React from "react"
import {
  Flips,
  LandingHeaderHome,
  HomepageStartList,
  UpcomingEvents,
} from "../../Components"
import {
  ContentNavigationList,
  type ContentNavigationListProps,
} from "../../Components/ContentNavigationList"
import {type FlipsProps} from "../../Components/Flips"
import {type SocialLinksSignupProps} from "../../Components/SocialLinksSignup"
import {type TutorialCardProps} from "../../Components/TutorialCard"
import {type UpcomingEventsProps} from "../../Components/UpcomingEvents"
import PageBackground from "../shared/PageBackground"
import PageSection from "../shared/PageSection"
import PageSections from "../shared/PageSections"
import {type HomepageStartItemProps} from "../../Components/HomepageStartItem"

export type HomePageProps = SocialLinksSignupProps & {
  concepts?: TutorialCardProps[]
  homepageStartProjectData: HomepageStartItemProps[]
  contentNavigationListItems: ContentNavigationListProps
  flips: FlipsProps
  upcomingEvents: UpcomingEventsProps
}

const Description = (): JSX.Element => (
  <>
    Start your Flow journey now with the{" "}
    <a href='https://play.flow.com/'>Flow Playground</a>, or explore our
    comprehensive guides, resources, and references to kickstart your Flow
    development.
  </>
)

const HomePage = ({
  homepageStartProjectData,
  contentNavigationListItems,
  discordUrl,
  flips,
  githubUrl,
  upcomingEvents,
}: HomePageProps): JSX.Element => {
  return (
    <PageBackground gradient='home'>
      <LandingHeaderHome
        description={<Description />}
        discordUrl={discordUrl}
        githubUrl={githubUrl}
        tag='onflow'
        title='Developer Documentation'
      />
      <HomepageStartList items={homepageStartProjectData} />
      <PageSections>
        {upcomingEvents.events.length > 0 && (
          <PageSection sectionId='upcoming-events'>
            <UpcomingEvents {...upcomingEvents} headerLink='upcoming-events' />
          </PageSection>
        )}
        <PageSection sectionId='explore-more-content'>
          <ContentNavigationList
            header={contentNavigationListItems.header}
            contentNavigationItems={
              contentNavigationListItems.contentNavigationItems
            }
            headerLink='explore-more-content'
          />
        </PageSection>
      </PageSections>
    </PageBackground>
  )
}

export default HomePage

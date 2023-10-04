import React from 'react'
import RssIcon from '../../../../images/content/rss.svg'
import { InternalContentLink } from '../InternalContentLink'

export interface NetworkDetailsCardProps {
  // status: 'Under Maintenance' | 'Healthy'
  statusLink: string
  version: string
  lastSporkDate: string
  nextSporkDate: string
  rssFeed?: string
}

const NetworkDetailsCard = ({
  // status,
  // statusLink,
  version,
  lastSporkDate,
  nextSporkDate,
}: NetworkDetailsCardProps): JSX.Element => {
  return (
    <div className="container">
      <div
        className="mx-auto flex flex-col items-center justify-center divide-primary-gray-100 rounded-2xl bg-white py-4 text-center dark:divide-primary-gray-400 dark:bg-primary-gray-dark md:flex-row md:divide-x-2 md:py-0"
        style={{ maxWidth: '1140px' }}
      >
        <div className="flex flex-col px-8 py-4">
          <p className="mb-2 text-xs uppercase text-primary-gray-200">
            Version
          </p>
          {version}
        </div>
        {/* <div className="flex flex-col px-8 py-4">
          <p
            className="mb-2 text-xs uppercase text-primary-gray-200"
            style={{ minWidth: '148px' }}
          >
            Status
          </p>
          <span>
            <InternalContentLink href={statusLink}>
              {status}
            </InternalContentLink>
          </span>
        </div> */}
        <div className="flex flex-col px-8 py-4">
          <p className="mb-2 text-xs uppercase text-primary-gray-200">
            Last Spork Date
          </p>
          {lastSporkDate}
        </div>
        <div className="flex flex-col px-8 py-4">
          <p className="mb-2 text-xs uppercase text-primary-gray-200">
            Next Spork Date
          </p>
          {nextSporkDate}
        </div>
        <div className="flex flex-col px-8 py-4">
          <p className="mb-2 text-xs uppercase text-primary-gray-200 dark:text-blue-dark">
            RSS Feed
          </p>
          {/* @ts-expect-error */}
          <InternalContentLink
            href="https://status.onflow.org"
            className="flex items-center hover:opacity-75"
          >
            <RssIcon />
          </InternalContentLink>
        </div>
      </div>
    </div>
  )
}

export default NetworkDetailsCard

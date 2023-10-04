import React from 'react'
import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import CopyIcon from '../../../../images/action/copy.svg'
import ChevronDownIcon from '../../../../images/arrows/chevron-down.svg'
import ChevronUpIcon from '../../../../images/arrows/chevron-up.svg'
import { type SporkMetadata } from '../../interfaces'
import { dateYYYYMMDD } from '../../utils/dates'

export interface SporksCardProps {
  heading: string
  timestamp: string
  sporkMetadata: SporkMetadata
  upcoming?: boolean
}

const CardItem = ({ label, data }: { label: string, data: any }) => (
  <div className="group flex items-center justify-between p-4">
    <div className="break-all">
      <span className="block uppercase text-primary-gray-300">{label}</span>
      {data}
    </div>
    <div
      className="hidden cursor-pointer text-primary-blue hover:text-primary-gray-400 group-hover:hidden md:group-hover:block"
      role="button"
      title={`Copy ${data}`}
      onClick={async () => { await navigator.clipboard.writeText(data.toString()) }}
    >
      <CopyIcon />
    </div>
  </div>
)

const Spork = ({ heading, timestamp, sporkMetadata }: SporksCardProps) => {
  const {
    accessNode,
    date,
    rootHeight,
    rootParentId,
    rootStateCommit,
    gitCommit,
  } = sporkMetadata

  return (
    <Disclosure>
      {({ open }) => {
        const cardStyles = clsx(
          'flex-col items-center justify-between px-4 rounded-2xl hover:shadow-2xl hover:bg-primary-gray-50 dark:hover:bg-primary-gray-400/50 dark:hover:shadow-2xl-dark md:px-8',
          {
            'bg-white dark:bg-primary-gray-dark': open,
            'dark:bg-black': !open,
          }
        )
        return (
          <>
            <div className={cardStyles}>
              <Disclosure.Button className="flex w-full cursor-pointer justify-between px-2 py-6 ease-in">
                <div className="flex items-center">
                  <span className="pr-4 text-2xl font-bold">{heading}</span>
                  <span className="border-l border-primary-gray-100 pl-4 text-primary-gray-300 dark:border-primary-gray-400">
                    {dateYYYYMMDD(timestamp)}
                  </span>
                </div>
                <div className="dark:text-primary-gray-200">
                  {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
              </Disclosure.Button>
            </div>
            <Disclosure.Panel>
              <div className="flex-col pb-4">
                {accessNode && (
                  <CardItem label="Access Node" data={accessNode} />
                )}
                <CardItem label="Date" data={dateYYYYMMDD(date)} />
                <CardItem label="Root Height" data={rootHeight} />
                <CardItem label="Root Parent ID" data={rootParentId} />
                <CardItem label="Root State Commit" data={rootStateCommit} />
                <CardItem label="Git Commit" data={gitCommit} />
              </div>
            </Disclosure.Panel>
          </>
        )
      }}
    </Disclosure>
  )
}

const UpcomingSpork = ({ heading }: Pick<SporksCardProps, 'heading'>) => {
  return (
    <div className="flex-col items-center justify-between rounded-2xl bg-white px-4 py-6 dark:bg-primary-gray-dark md:px-8">
      <div className="flex flex-col items-center justify-start px-2 md:flex-row">
        <span className="text-2xl font-bold md:pr-4">{heading}</span>
        <hr className="my-4 inline-block w-6 md:hidden" />
        <span className="border-primary-gray-100 dark:border-primary-gray-400 md:border-l md:pl-4">
          TBD
        </span>
      </div>
    </div>
  )
}

const SporksCard = ({
  heading,
  timestamp,
  sporkMetadata,
  upcoming = false,
}: SporksCardProps) => {
  return upcoming
    ? (
    <UpcomingSpork heading={heading} />
      )
    : (
    <Spork
      heading={heading}
      timestamp={timestamp}
      sporkMetadata={sporkMetadata}
    />
      )
}

export default SporksCard

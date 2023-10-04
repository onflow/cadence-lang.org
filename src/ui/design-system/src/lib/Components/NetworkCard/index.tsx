import React from 'react'
import clsx from 'clsx'

import ChevronRightIcon from '../../../../images/arrows/chevron-right.svg'
import AppLink from '../AppLink'

export interface NetworkCardProps {
  networkName: string
  // status: 'Under Maintenance' | 'Healthy'
  version: string
  lastSporkDate: string
  nextSporkDate: string
  link: string
}

const NetworkCard = ({
  networkName,
  // status,
  version,
  lastSporkDate,
  nextSporkDate,
  link,
}: NetworkCardProps): JSX.Element => {
  // const statusClasses = clsx('rounded-full w-11 h-11 md:mb-0 mb-4', {
  //   'bg-primary-red': status === 'Under Maintenance',
  //   'bg-green-success': status === 'Healthy',
  // })

  const statusClasses = 'rounded-full w-11 h-11 md:mb-0 mb-4'

  return (
    <AppLink
      to={link}
      className="flex flex-col items-center justify-around rounded-2xl bg-white px-4 py-7 text-center hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark md:flex-row md:text-left"
    >
      <div className="flex flex-col items-center md:flex-row">
        <div className={statusClasses} />
        <span className="mb-6 ml-0 w-[180px] text-2xl font-bold md:ml-6 md:mb-0">
          {networkName}
        </span>
      </div>

      {/* <div className="mb-4 md:mb-0">
        <p className="mb-2 text-sm uppercase text-primary-gray-300">Status</p>
        {status}
      </div> */}

      <div className="mb-4 md:mb-0">
        <p className="mb-2 text-sm uppercase text-primary-gray-300">Version</p>
        {version}
      </div>

      <div className="mb-4 md:mb-0">
        <p className="mb-2 text-sm uppercase text-primary-gray-300">
          Last Spork Date
        </p>
        {lastSporkDate}
      </div>

      <div className="mb-4 md:mb-0">
        <p className="mb-2 text-sm uppercase text-primary-gray-300">
          Next Spork Date
        </p>
        {nextSporkDate}
      </div>

      <div className="hidden md:inline-block">
        <ChevronRightIcon />
      </div>
    </AppLink>
  )
}

export default NetworkCard

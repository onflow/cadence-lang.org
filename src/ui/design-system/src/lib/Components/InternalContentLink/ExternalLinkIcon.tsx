import React from 'react'
export type ExternalLinkIconProps = React.ComponentPropsWithoutRef<'svg'>

function ExternalLinkIcon (props: ExternalLinkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 19 18"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
        d="M4.05 13.95l9.9-9.9M7 3.725h7.45v7.45"
      ></path>
    </svg>
  )
}

export default ExternalLinkIcon

import * as React from "react"
import { useId } from "../../src/lib/utils/useId"

/**
 * This should be use in place of the SVGR-generated SvgToolDefault icon in
 * order to:
 * 1. Provide dark-mode customizations
 * 2. Ensure each instance of this component uses it's own filter IDs. Otherwise
 *    rendering multiple instances at once on the screen can cause hover effects
 *    on one instance to carry over into all other instances.
 *
 * If tool-default.svg is updated, this file should be updated appropriately!
 */
const SvgToolDefaultOverride = (
  props: React.ComponentPropsWithoutRef<"svg">
) => {
  const id = useId()

  return (
    <svg
      viewBox="0 0 250 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter={`url(#tool-default_svg__a-${id})`}>
        <rect
          width={250}
          height={250}
          rx={16}
          fill={`url(#tool-default_svg__b-${id})`}
          fillOpacity={0.33}
        />
      </g>
      <path
        d="M92.429 151.857 65 124.429 92.429 97M113.857 153.143 136.571 97M157.571 97 185 124.429l-27.429 27.428"
        stroke="#2F353F"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-primary-gray-200"
      />
      <defs>
        <linearGradient
          id={`tool-default_svg__b-${id}`}
          x1={37.698}
          y1={-19.841}
          x2={250}
          y2={250}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <filter
          id={`tool-default_svg__a-${id}`}
          x={-49.016}
          y={-49.016}
          width={348.032}
          height={348.032}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation={24.508} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_326_6545"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_326_6545"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx={3.18} dy={3.18} />
          <feGaussianBlur stdDeviation={2.5} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 0.928409 0 0 0 0 0.978523 0 0 0 0 1 0 0 0 0.2 0" />
          <feBlend in2="shape" result="effect2_innerShadow_326_6545" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx={-3.18} dy={-3.18} />
          <feGaussianBlur stdDeviation={2.5} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend
            in2="effect2_innerShadow_326_6545"
            result="effect3_innerShadow_326_6545"
          />
        </filter>
      </defs>
    </svg>
  )
}
export const ReactComponent = SvgToolDefaultOverride
export default SvgToolDefaultOverride

import clsx from "clsx"
import React, { useState } from "react"

import PlayCircle from "../../../../images/action/play-circle.svg"
import Time from "../../../../images/content/date.svg"
import { useExtractYoutubeVideoId } from "./useExtractYoutubeVideoId"
import { VideoCardError, VideoCardErrorProps } from "./VideoCardError"

export interface LargeVideoCardProps {
  link: string // NOTE: link should be in the format that youtubes site uses ie: https://www.youtube.com/watch?v=...
  title: string
  length: number // seconds
  className?: string
  errorBehavior?: VideoCardErrorProps["behavior"]
}

export function LargeVideoCard({
  link,
  title,
  length,
  className,
  errorBehavior = "render-comment",
}: LargeVideoCardProps) {
  const extractResult = useExtractYoutubeVideoId(link)
  const [showOverlay, setShowOverlay] = useState(true)

  const minutes = String(Math.floor(length / 60)).padStart(2, "0")
  const seconds = length % 60

  if ("error" in extractResult) {
    return (
      <VideoCardError
        behavior={errorBehavior}
        error={`${extractResult.error}. LargeVideoCard expects a YouTube embed URL containing a video ID`}
      />
    )
  }

  const { videoId } = extractResult

  return (
    <div
      className={clsx(
        className,
        "relative h-full w-full cursor-pointer rounded-lg"
      )}
    >
      {showOverlay ? (
        <>
          <div
            className="absolute h-full w-full overflow-hidden rounded-lg"
            onClick={() => setShowOverlay(false)}
          >
            <img
              className="h-full w-full rounded-lg object-cover transition ease-in-out hover:scale-110"
              src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            />
          </div>

          <div className="pointer-events-none absolute h-full w-full rounded-lg bg-black opacity-70" />

          <div className="pointer-events-none absolute grid h-full w-full place-items-center">
            <PlayCircle width={56} height={56} />
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 w-full p-6 text-white md:w-3/4">
            <div className="text-h4 leading-8 text-white line-clamp-2">
              {title}
            </div>
            <div className="items-align flex gap-2">
              <Time
                className="stroke-white"
                height={20}
                width={20}
                viewBox="0 0 24 24"
              />
              <div className="text-base">
                {minutes}:{seconds}
              </div>
            </div>
          </div>
        </>
      ) : null}
      <iframe
        className="h-full w-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}${
          showOverlay ? "" : "?autoplay=1"
        }`}
      />
    </div>
  )
}

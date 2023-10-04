import React from 'react'
import PlayCircle from "../../../../images/action/play-circle.svg"
import TimeIcon from "../../../../images/content/date.svg"
import ExternalLinkIcon from "../../../../images/content/external-link.svg"
import AppLink from "../AppLink"
import Tag from "../Tag"
import { LargeVideoCardProps } from "./LargeVideoCard"
import { useExtractYoutubeVideoId } from "./useExtractYoutubeVideoId"
import { VideoCardError } from "./VideoCardError"

export interface SmallVideoCardProps extends LargeVideoCardProps {
  tags: string[]
}

export function SmallVideoCard({
  title,
  length,
  tags,
  link,
  errorBehavior = "render-comment",
}: SmallVideoCardProps) {
  const extractResult = useExtractYoutubeVideoId(link)
  const minutes = String(Math.floor(length / 60)).padStart(2, "0")
  const seconds = length % 60

  if ("error" in extractResult) {
    return (
      <VideoCardError
        behavior={errorBehavior}
        error={`${extractResult.error}. SmallVideoCard expects a YouTube embed URL containing a video ID`}
      />
    )
  }

  return (
    <AppLink
      to={link}
      className="flex gap-4 rounded-xl bg-white p-6 transition ease-in hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark"
    >
      <div className="aspect-square h-min rounded bg-gradient-to-br from-fuchsia-200 to-cyan-200 p-7">
        <PlayCircle height={32} width={32} viewBox="0 0 32 32" />
      </div>
      <div className="w-full">
        <div className="flex justify-between">
          <h6 className="text-xl font-semibold leading-6 line-clamp-2 dark:text-white">
            {title}
          </h6>
          <div>
            <ExternalLinkIcon className="text-gray-700 dark:text-gray-600" />
          </div>
        </div>
        <div className="line-clamp-1">
          {tags.map((tag, i) => (
            <div className="inline-block p-px" key={i}>
              <Tag name={tag} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 pt-1 text-gray-500">
          <TimeIcon viewBox="0 0 24 24" height={16} width={16} />
          <div className="text-base leading-3">
            {minutes}:{seconds}
          </div>
        </div>
      </div>
    </AppLink>
  )
}

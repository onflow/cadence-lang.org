import React from "react"

/**
 * There are many formats for a Youtube embed URL. I took this regex from:
 * https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486?permalink_comment_id=3262368#gistcomment-3262368
 * it seems pretty exhaustive and works for our current use-cases.
 */
//
const YOUTUBE_URL_REGEX =
  // eslint-disable-next-line
  /(?:http:|https:)*?\/\/(?:www\.|)(?:youtube\.com|m\.youtube\.com|youtu\.|youtube-nocookie\.com).*(?:v=|v%3D|v\/|(?:a|p)\/(?:a|u)\/\d.*\/|watch\?|vi(?:=|\/)|\/embed\/|oembed\?|be\/|e\/)([^&?%#\/\n]*)/im

export type ExtractYoutubeVideoIdResult =
  | {
      error: string
    }
  | {
      videoId: string
    }

export const useExtractYoutubeVideoId = (
  src: string
): ExtractYoutubeVideoIdResult =>
  React.useMemo(() => {
    const result = src.match(YOUTUBE_URL_REGEX)

    if (!result) {
      return {
        error: "Unrecognized URL",
      }
    }

    if (!result[1]) {
      return {
        error: "Video ID not found",
      }
    }

    return {
      videoId: result[1],
    }
  }, [src])

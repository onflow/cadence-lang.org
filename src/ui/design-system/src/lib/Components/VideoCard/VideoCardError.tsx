export interface VideoCardErrorProps {
  behavior: "throw" | "render-comment" | "render-null"
  error: string
}

/**
 *
 * Rendered when there is an error extracting the video ID from a video `link`.
 * @returns
 */
export function VideoCardError({ behavior, error }: VideoCardErrorProps) {
  switch (behavior) {
    case "throw": {
      throw error
    }
    case "render-comment": {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `<!-- ${error.replace(/--/, " - ")} -->`,
          }}
        />
      )
    }
    case "render-null": {
      return null
    }
  }
}

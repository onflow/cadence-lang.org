import { format as formatDate, parseISO } from "date-fns"
import { ReactNode } from "react"

export interface TimeProps {
  /**
   * The date value as an ISO 8601 string.
   */
  value: string

  /**
   * The output format.
   * @see {@link https://date-fns.org/v2.29.2/docs/format}
   */
  format?: string

  /**
   * A fallback component to render if parsing fails.
   */
  fallback?: ReactNode | undefined
}

export function Time({ value, format = "P", fallback = null }: TimeProps) {
  let date: Date | undefined = undefined

  try {
    date = parseISO(value)
  } catch (error) {
    return <>{fallback}</>
  }

  // TODO: rendering formatting strings on the server and then hydrating
  // on the client can cause "prop mismatch" warnings from react due to
  // the server possibly being in a different timezone/locale. Is there a
  // good way to mitigate these?

  return (
    <time dateTime={date.toISOString()} title={date.toISOString()}>
      {formatDate(date, format)}
    </time>
  )
}

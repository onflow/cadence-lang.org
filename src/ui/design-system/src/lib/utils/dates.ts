import { format, parseISO } from "date-fns"

export function dateYYYYMMDD(str: string) {
  const parsedDate = parseISO(str)
  return format(parsedDate, "yyyy/M/d")
}

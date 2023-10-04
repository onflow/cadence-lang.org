import { createContext, useContext, useEffect } from "react"

export const InternalPageEditUrlContext = createContext<{
  value: undefined | string
  setValue: (newValue: undefined | string) => void
}>({
  value: undefined,
  setValue: () => {},
})

/**
 * Sets the "edit page" URL for the current content.  Allows a child component
 * to tell a parent component what the URL should be.
 */
export const useProvideInternalPageEditUrl = (url: string | undefined) => {
  const { setValue } = useContext(InternalPageEditUrlContext)

  useEffect(() => {
    setValue(url)

    return () => {
      setValue(undefined)
    }
  }, [setValue, url])
}

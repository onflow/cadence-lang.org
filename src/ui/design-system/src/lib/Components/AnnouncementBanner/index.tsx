import { ReactNode } from "react"

interface AnnouncementBannerProps {
  children: ReactNode
}

export function AnnouncementBanner({ children }: AnnouncementBannerProps) {
  return (
    <div className="flex justify-center bg-gradient-to-r from-primary-green to-[#00feff] px-1 py-2 text-center text-xs font-semibold text-black md:text-base">
      {children}
    </div>
  )
}

export interface StatuspageApiResponse {
  id: string
  page_id: string
  group_id?: string
  created_at: string
  updated_at: string
  group: boolean
  name: string
  description?: string
  position: number
  status: string
  showcase: boolean
  only_show_if_degraded: boolean
  automation_email: string
  start_date: string
}
export interface SporkMetadata {
  accessNode: string
  date: string
  rootHeight: string
  rootParentId: string
  rootStateCommit: string
  gitCommit: string
  branchOrTag?: string
  dockerTag?: string
}

export interface Article {
  heading: string
  description: string
  ctaText: string
  ctaLink: string
  imageUrl: string
}

export interface User {
  name: string
  profileImage: string
}

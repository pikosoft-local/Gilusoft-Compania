export const CMS_COLLECTIONS = [
  'projects',
  'websites',
  'certificates',
  'blog',
  'team',
  'pages',
  'translations',
  'site',
] as const

export type CmsCollection = (typeof CMS_COLLECTIONS)[number]

export interface CmsEntry {
  id: string
  collection: CmsCollection
  slug: string
  locale: string
  title: string
  summary: string
  image_url: string
  content: Record<string, unknown>
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CmsUser {
  id: string
  email?: string
}

export interface AuthenticatedRequest {
  cmsUser: CmsUser
}

export const CLIENT_PRODUCT_CATEGORIES = ['app', 'website', 'ai_integration'] as const
export type ClientProductCategory = (typeof CLIENT_PRODUCT_CATEGORIES)[number]

export const CLIENT_PRODUCT_STATUSES = [
  'planning',
  'in_progress',
  'review',
  'live',
  'maintenance',
] as const
export type ClientProductStatus = (typeof CLIENT_PRODUCT_STATUSES)[number]

export interface ClientProduct {
  id: string
  user_id: string
  name: string
  category: ClientProductCategory
  description: string
  status: ClientProductStatus
  url: string
  created_at: string
  updated_at: string
  username?: string
  display_name?: string
}

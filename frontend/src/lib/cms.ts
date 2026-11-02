import { supabase } from './supabase'

export const cmsCollections = [
  'projects',
  'websites',
  'certificates',
  'blog',
  'team',
  'pages',
  'translations',
  'site',
] as const

export type CmsCollection = (typeof cmsCollections)[number]

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

export interface CmsEntryInput {
  slug: string
  locale: string
  title: string
  summary: string
  imageUrl: string
  content: Record<string, unknown>
  published: boolean
  sortOrder: number
}

export type ClientProductCategory = 'app' | 'website' | 'ai_integration'
export type ClientProductStatus = 'planning' | 'in_progress' | 'review' | 'live' | 'maintenance'

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

export interface ClientProfile {
  user_id: string
  username: string
  display_name: string
}

export interface ClientProductInput {
  username: string
  name: string
  category: ClientProductCategory
  description: string
  status: ClientProductStatus
  url: string
}

export interface AdminLoginSession {
  access_token: string
  refresh_token: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

export function isCmsApiConfigured() {
  return Boolean(apiBaseUrl)
}

async function getAccessToken() {
  if (!supabase) throw new Error('Zaloguj się do Supabase, aby otworzyć panel CMS.')
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session) throw new Error('Sesja logowania wygasła. Zaloguj się ponownie.')
  return data.session.access_token
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  if (!apiBaseUrl) throw new Error('Skonfiguruj VITE_API_URL, aby połączyć się z backendem CMS.')
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (authenticated) headers.set('Authorization', `Bearer ${await getAccessToken()}`)

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new Error(message || `Żądanie do CMS nie powiodło się (${response.status}).`)
  }
  return response.json() as Promise<T>
}

export async function getPublicEntries(collection: CmsCollection, locale: string) {
  return request<{ items: CmsEntry[] }>(
    `/content/${collection}?locale=${encodeURIComponent(locale)}`,
  )
}

export async function getAdminEntries(collection: CmsCollection) {
  return request<{ items: CmsEntry[] }>(
    `/admin/content/${collection}`,
    {},
    true,
  )
}

export async function saveAdminEntry(collection: CmsCollection, input: CmsEntryInput) {
  return request<CmsEntry>(
    `/admin/content/${collection}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
    true,
  )
}

export async function deleteAdminEntry(collection: CmsCollection, id: string) {
  return request<{ deleted: boolean }>(
    `/admin/content/${collection}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    true,
  )
}

export async function verifyCmsAdmin() {
  return request<{ user: { id: string; email?: string }; isAdmin: boolean }>(
    '/admin/me',
    {},
    true,
  )
}

export async function signInAdminWithUsername(username: string, password: string) {
  return request<{ session: AdminLoginSession }>(
    '/auth/admin/username',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
  )
}

export async function getClientProducts() {
  return request<{ items: ClientProduct[] }>('/client/products', {}, true)
}

export async function getAdminClientProducts() {
  return request<{ items: ClientProduct[] }>('/admin/client-products', {}, true)
}

export async function getAdminClients() {
  return request<{ items: ClientProfile[] }>('/admin/client-products/clients', {}, true)
}

export async function saveAdminClientProduct(input: ClientProductInput, id?: string) {
  return request<ClientProduct>(
    id ? `/admin/client-products/${encodeURIComponent(id)}` : '/admin/client-products',
    { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) },
    true,
  )
}

export async function deleteAdminClientProduct(id: string) {
  return request<{ deleted: boolean }>(
    `/admin/client-products/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    true,
  )
}

export async function uploadCmsImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<{ path: string; url: string }>(
    '/admin/uploads',
    { method: 'POST', body: formData },
    true,
  )
}

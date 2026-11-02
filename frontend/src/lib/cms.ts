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

export async function uploadCmsImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<{ path: string; url: string }>(
    '/admin/uploads',
    { method: 'POST', body: formData },
    true,
  )
}

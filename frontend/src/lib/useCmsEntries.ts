import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPublicEntries, isCmsApiConfigured, type CmsCollection, type CmsEntry } from './cms'

export function useCmsEntries(collection: CmsCollection, fallback: CmsEntry[]) {
  return useCmsEntriesWithStatus(collection, fallback).items
}

export function useCmsEntriesWithStatus(collection: CmsCollection, fallback: CmsEntry[]) {
  const { i18n } = useTranslation()
  const [items, setItems] = useState(fallback)
  const [loading, setLoading] = useState(isCmsApiConfigured())

  useEffect(() => {
    let active = true
    if (!isCmsApiConfigured()) return () => { active = false }
    getPublicEntries(collection, i18n.language)
      .then(({ items: published }) => {
        if (active) setItems(published)
      })
      .catch((error: unknown) => {
        console.error(`Could not load public CMS collection "${collection}".`, error)
        if (active) setItems(fallback)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [collection, fallback, i18n.language])

  return { items, loading }
}

export function makeFallbackEntries<T extends {
  number?: string
  slug?: string
  href?: string
  name?: string
  title?: string
  description?: string
  summary?: string
  image?: string
  issuer?: string
  year?: string
  type?: string
}>(
  collection: CmsCollection,
  values: T[],
): CmsEntry[] {
  return values.map((value, index) => {
    const slug = value.slug ?? `${collection}-${value.number ?? index + 1}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
    return {
      id: `fallback-${slug}`,
      collection,
      slug,
      locale: 'all',
      title: value.title ?? value.name ?? '',
      summary: value.summary ?? value.description ?? value.issuer ?? value.type ?? '',
      image_url: value.image ?? '',
      content: {
        ...(value.year ? { year: value.year } : {}),
        ...(value.href ? { href: value.href } : {}),
      },
      published: true,
      sort_order: index,
      created_at: '',
      updated_at: '',
    }
  })
}

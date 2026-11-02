import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import type { CmsCollection } from './cms.types'

@Injectable()
export class PublicContentService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(collection: CmsCollection, locale: string) {
    const baseQuery = this.supabase.admin
      .from('cms_entries')
      .select('id, collection, slug, locale, title, summary, image_url, content, published, sort_order, created_at, updated_at')
      .eq('collection', collection)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (collection === 'translations') {
      const { data, error } = await baseQuery.eq('locale', locale)
      if (error) this.supabase.reportDatabaseError('Could not load published CMS content.', error)
      return { items: data ?? [] }
    }

    const [{ data: localized, error: localizedError }, { data: defaults, error: defaultsError }] =
      await Promise.all([
        baseQuery.eq('locale', locale),
        this.supabase.admin
          .from('cms_entries')
          .select('id, collection, slug, locale, title, summary, image_url, content, published, sort_order, created_at, updated_at')
          .eq('collection', collection)
          .eq('published', true)
          .eq('locale', 'all')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
      ])
    if (localizedError || defaultsError) {
      this.supabase.reportDatabaseError(
        'Could not load published CMS content.',
        localizedError ?? defaultsError,
      )
    }

    const bySlug = new Map((defaults ?? []).map((entry) => [entry.slug, entry]))
    for (const entry of localized ?? []) bySlug.set(entry.slug, entry)
    return { items: [...bySlug.values()].sort((a, b) => a.sort_order - b.sort_order) }
  }
}

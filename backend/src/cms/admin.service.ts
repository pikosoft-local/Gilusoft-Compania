import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import type { CmsCollection } from './cms.types'
import type { UpsertCmsEntryDto } from './dto/upsert-cms-entry.dto'

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(collection: CmsCollection) {
    const { data, error } = await this.supabase.admin
      .from('cms_entries')
      .select('id, collection, slug, locale, title, summary, image_url, content, published, sort_order, created_at, updated_at')
      .eq('collection', collection)
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })

    if (error) this.supabase.reportDatabaseError('Could not load CMS entries.', error)
    return { items: data ?? [] }
  }

  async upsert(collection: CmsCollection, input: UpsertCmsEntryDto, userId: string) {
    const { data, error } = await this.supabase.admin
      .from('cms_entries')
      .upsert({
        collection,
        slug: input.slug,
        locale: input.locale ?? 'all',
        title: input.title ?? '',
        summary: input.summary ?? '',
        image_url: input.imageUrl ?? '',
        content: input.content,
        published: input.published ?? false,
        sort_order: input.sortOrder ?? 0,
        created_by: userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'collection,slug,locale' })
      .select('id, collection, slug, locale, title, summary, image_url, content, published, sort_order, created_at, updated_at')
      .single()

    if (error) this.supabase.reportDatabaseError('Could not save CMS entry.', error)
    return data
  }

  async remove(collection: CmsCollection, id: string) {
    const { data, error } = await this.supabase.admin
      .from('cms_entries')
      .delete()
      .eq('id', id)
      .eq('collection', collection)
      .select('id')
      .maybeSingle()

    if (error) this.supabase.reportDatabaseError('Could not delete CMS entry.', error)
    if (!data) throw new NotFoundException('CMS entry was not found.')
    return { deleted: true }
  }
}

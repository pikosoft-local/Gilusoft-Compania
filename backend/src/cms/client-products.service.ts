import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import type { UpsertClientProductDto } from './dto/upsert-client-product.dto'

const productColumns =
  'id, user_id, name, category, description, status, url, created_at, updated_at'

@Injectable()
export class ClientProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listForUser(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('client_products')
      .select(productColumns)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) this.supabase.reportDatabaseError('Could not load client products.', error)
    return { items: data ?? [] }
  }

  async listForAdmins() {
    const { data: products, error } = await this.supabase.admin
      .from('client_products')
      .select(productColumns)
      .order('updated_at', { ascending: false })

    if (error) this.supabase.reportDatabaseError('Could not load managed client products.', error)
    if (!products?.length) return { items: [] }

    const { data: profiles, error: profilesError } = await this.supabase.admin
      .from('profiles')
      .select('user_id, username, display_name')
      .in('user_id', products.map((product) => product.user_id))

    if (profilesError) {
      this.supabase.reportDatabaseError('Could not load client product owners.', profilesError)
    }

    const profilesByUserId = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]))
    return {
      items: products.map((product) => {
        const profile = profilesByUserId.get(product.user_id)
        return {
          ...product,
          username: profile?.username,
          display_name: profile?.display_name,
        }
      }),
    }
  }

  async listClients() {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('user_id, username, display_name')
      .order('username', { ascending: true })

    if (error) this.supabase.reportDatabaseError('Could not load client accounts.', error)
    return { items: data ?? [] }
  }

  async create(input: UpsertClientProductDto) {
    const userId = await this.resolveUserId(input.username)
    const { data, error } = await this.supabase.admin
      .from('client_products')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        category: input.category,
        description: input.description?.trim() ?? '',
        status: input.status,
        url: input.url?.trim() ?? '',
      })
      .select(productColumns)
      .single()

    if (error) this.supabase.reportDatabaseError('Could not create client product.', error)
    return data
  }

  async update(id: string, input: UpsertClientProductDto) {
    const userId = await this.resolveUserId(input.username)
    const { data, error } = await this.supabase.admin
      .from('client_products')
      .update({
        user_id: userId,
        name: input.name.trim(),
        category: input.category,
        description: input.description?.trim() ?? '',
        status: input.status,
        url: input.url?.trim() ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(productColumns)
      .maybeSingle()

    if (error) this.supabase.reportDatabaseError('Could not update client product.', error)
    if (!data) throw new NotFoundException('Client product was not found.')
    return data
  }

  async remove(id: string) {
    const { data, error } = await this.supabase.admin
      .from('client_products')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) this.supabase.reportDatabaseError('Could not delete client product.', error)
    if (!data) throw new NotFoundException('Client product was not found.')
    return { deleted: true }
  }

  private async resolveUserId(username: string) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .maybeSingle()

    if (error) this.supabase.reportDatabaseError('Could not find client account.', error)
    if (!data) throw new NotFoundException(`Client account "${username}" was not found.`)
    return data.user_id
  }
}

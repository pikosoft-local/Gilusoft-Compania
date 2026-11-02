import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name)
  private readonly client: SupabaseClient | null
  private readonly url: string | undefined
  private readonly serviceKey: string | undefined
  private readonly bucketName: string

  get isConfigured() {
    return this.client !== null && this.url !== undefined && this.serviceKey !== undefined
  }

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL')
    const serviceKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY')
    this.url = url
    this.serviceKey = serviceKey
    this.bucketName = config.get<string>('CMS_STORAGE_BUCKET') ?? 'cms-assets'

    this.client = url && serviceKey
      ? createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      : null
  }

  get admin() {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'CMS backend requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      )
    }
    return this.client
  }

  get storageBucket() {
    return this.bucketName
  }

  async signInWithPassword(email: string, password: string) {
    if (!this.url || !this.serviceKey) {
      throw new ServiceUnavailableException(
        'Username sign-in requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      )
    }

    const authClient = createClient(this.url, this.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return authClient.auth.signInWithPassword({ email, password })
  }

  async checkCmsConnection() {
    if (!this.client) return false
    const { error } = await this.client
      .from('cms_entries')
      .select('id')
      .limit(1)
    if (!error) return true
    this.logger.warn(`CMS database health check failed: ${JSON.stringify(error)}`)
    return false
  }

  reportDatabaseError(message: string, error: unknown): never {
    this.logger.error(
      message,
      error instanceof Error ? error.stack : JSON.stringify(error),
    )
    throw new ServiceUnavailableException(message)
  }
}

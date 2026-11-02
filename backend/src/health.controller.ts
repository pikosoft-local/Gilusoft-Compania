import { Controller, Get } from '@nestjs/common'
import { SupabaseService } from './supabase/supabase.service'

@Controller('health')
export class HealthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async getHealth() {
    const databaseAvailable = await this.supabase.checkCmsConnection()
    return {
      status: databaseAvailable ? 'ok' : 'degraded',
      supabaseConfigured: this.supabase.isConfigured,
      databaseAvailable,
    }
  }
}

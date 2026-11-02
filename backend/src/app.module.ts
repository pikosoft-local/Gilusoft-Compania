import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './cms/admin.module'
import { PublicContentModule } from './cms/public-content.module'
import { HealthController } from './health.controller'
import { SupabaseModule } from './supabase/supabase.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    PublicContentModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './cms/admin.module'
import { ClientProductsModule } from './cms/client-products.module'
import { PublicContentModule } from './cms/public-content.module'
import { HealthController } from './health.controller'
import { SupabaseModule } from './supabase/supabase.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    PublicContentModule,
    AdminModule,
    ClientProductsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

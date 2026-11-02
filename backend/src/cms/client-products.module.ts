import { Module } from '@nestjs/common'
import { AdminClientProductsController } from './admin-client-products.controller'
import { ClientProductsController } from './client-products.controller'
import { ClientProductsService } from './client-products.service'
import { CmsAdminGuard } from './cms-admin.guard'
import { SupabaseAuthGuard } from './supabase-auth.guard'

@Module({
  controllers: [ClientProductsController, AdminClientProductsController],
  providers: [ClientProductsService, SupabaseAuthGuard, CmsAdminGuard],
})
export class ClientProductsModule {}

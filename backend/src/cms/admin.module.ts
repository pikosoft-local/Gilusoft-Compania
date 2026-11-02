import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { CmsAdminGuard } from './cms-admin.guard'
import { CmsCollectionPipe } from './cms-collection.pipe'
import { SupabaseAuthGuard } from './supabase-auth.guard'

@Module({
  controllers: [AdminController],
  providers: [AdminService, SupabaseAuthGuard, CmsAdminGuard, CmsCollectionPipe],
})
export class AdminModule {}

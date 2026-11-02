import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { ClientProductsService } from './client-products.service'
import type { AuthenticatedRequest } from './cms.types'
import { SupabaseAuthGuard } from './supabase-auth.guard'

@Controller('client/products')
@UseGuards(SupabaseAuthGuard)
export class ClientProductsController {
  constructor(private readonly products: ClientProductsService) {}

  @Get()
  list(
    @Req() request: Request & { cmsUser: AuthenticatedRequest['cmsUser'] },
  ) {
    return this.products.listForUser(request.cmsUser.id)
  }
}

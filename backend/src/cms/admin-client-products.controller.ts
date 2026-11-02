import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { CmsAdminGuard } from './cms-admin.guard'
import { ClientProductsService } from './client-products.service'
import { SupabaseAuthGuard } from './supabase-auth.guard'
import { UpsertClientProductDto } from './dto/upsert-client-product.dto'

@Controller('admin/client-products')
@UseGuards(SupabaseAuthGuard, CmsAdminGuard)
export class AdminClientProductsController {
  constructor(private readonly products: ClientProductsService) {}

  @Get()
  list() {
    return this.products.listForAdmins()
  }

  @Get('clients')
  listClients() {
    return this.products.listClients()
  }

  @Post()
  create(@Body() input: UpsertClientProductDto) {
    return this.products.create(input)
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpsertClientProductDto,
  ) {
    return this.products.update(id, input)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id)
  }
}

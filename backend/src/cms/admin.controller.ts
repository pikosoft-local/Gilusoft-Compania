import {
  Controller,
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request } from 'express'
import type { Express } from 'express'
import { memoryStorage } from 'multer'
import { randomUUID } from 'node:crypto'
import { CmsAdminGuard } from './cms-admin.guard'
import { CmsCollectionPipe } from './cms-collection.pipe'
import type { AuthenticatedRequest, CmsCollection } from './cms.types'
import { SupabaseAuthGuard } from './supabase-auth.guard'
import { AdminService } from './admin.service'
import { UpsertCmsEntryDto } from './dto/upsert-cms-entry.dto'
import { SupabaseService } from '../supabase/supabase.service'

@Controller('admin')
@UseGuards(SupabaseAuthGuard, CmsAdminGuard)
export class AdminController {
  constructor(
    private readonly content: AdminService,
    private readonly supabase: SupabaseService,
  ) {}

  @Get('me')
  me(@Req() request: Request & { cmsUser: AuthenticatedRequest['cmsUser'] }) {
    return { user: request.cmsUser, isAdmin: true }
  }

  @Get('content/:collection')
  list(@Param('collection', CmsCollectionPipe) collection: CmsCollection) {
    return this.content.list(collection)
  }

  @Post('content/:collection')
  create(
    @Param('collection', CmsCollectionPipe) collection: CmsCollection,
    @Req() request: Request & { cmsUser: AuthenticatedRequest['cmsUser'] },
    @Body() input: UpsertCmsEntryDto,
  ) {
    return this.content.upsert(collection, input, request.cmsUser.id)
  }

  @Put('content/:collection')
  update(
    @Param('collection', CmsCollectionPipe) collection: CmsCollection,
    @Req() request: Request & { cmsUser: AuthenticatedRequest['cmsUser'] },
    @Body() input: UpsertCmsEntryDto,
  ) {
    return this.content.upsert(collection, input, request.cmsUser.id)
  }

  @Delete('content/:collection/:id')
  remove(
    @Param('collection', CmsCollectionPipe) collection: CmsCollection,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.content.remove(collection, id)
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
      callback(null, allowedTypes.has(file.mimetype))
    },
  }))
  async upload(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Choose a JPEG, PNG, WebP or AVIF image under 10 MB.')
    }
    const extension = file.mimetype.split('/')[1]
    const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`
    const { error } = await this.supabase.admin.storage
      .from(this.supabase.storageBucket)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false })

    if (error) this.supabase.reportDatabaseError('Could not upload CMS image.', error)
    const { data } = this.supabase.admin.storage
      .from(this.supabase.storageBucket)
      .getPublicUrl(path)
    return { path, url: data.publicUrl }
  }
}

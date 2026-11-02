import { Controller, Get, Param, Query } from '@nestjs/common'
import { CmsCollectionPipe } from './cms-collection.pipe'
import type { CmsCollection } from './cms.types'
import { PublicContentService } from './public-content.service'

@Controller('content')
export class PublicContentController {
  constructor(private readonly content: PublicContentService) {}

  @Get(':collection')
  list(
    @Param('collection', CmsCollectionPipe) collection: CmsCollection,
    @Query('locale') locale = 'pl',
  ) {
    return this.content.list(collection, locale)
  }
}

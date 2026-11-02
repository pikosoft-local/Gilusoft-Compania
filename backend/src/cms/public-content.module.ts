import { Module } from '@nestjs/common'
import { CmsCollectionPipe } from './cms-collection.pipe'
import { PublicContentController } from './public-content.controller'
import { PublicContentService } from './public-content.service'

@Module({
  controllers: [PublicContentController],
  providers: [PublicContentService, CmsCollectionPipe],
})
export class PublicContentModule {}

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { CMS_COLLECTIONS, type CmsCollection } from './cms.types'

@Injectable()
export class CmsCollectionPipe implements PipeTransform<string, CmsCollection> {
  transform(value: string): CmsCollection {
    if ((CMS_COLLECTIONS as readonly string[]).includes(value)) {
      return value as CmsCollection
    }
    throw new BadRequestException(`Unknown CMS collection: ${value}`)
  }
}

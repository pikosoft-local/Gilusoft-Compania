import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'
import {
  CLIENT_PRODUCT_CATEGORIES,
  CLIENT_PRODUCT_STATUSES,
} from '../client-products.types'

export class UpsertClientProductDto {
  @IsString()
  @Matches(/^[a-z0-9_]{3,24}$/)
  username!: string

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string

  @IsIn(CLIENT_PRODUCT_CATEGORIES)
  category!: (typeof CLIENT_PRODUCT_CATEGORIES)[number]

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description = ''

  @IsIn(CLIENT_PRODUCT_STATUSES)
  status!: (typeof CLIENT_PRODUCT_STATUSES)[number]

  @IsString()
  @MaxLength(2048)
  @ValidateIf((_object, value: unknown) => value !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url = ''
}

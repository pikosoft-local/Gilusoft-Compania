import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator'

export class UpsertCmsEntryDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{0,119}$/)
  slug!: string

  @IsOptional()
  @IsString()
  @Matches(/^(all|pl|en|de|fr)$/)
  locale = 'all'

  @IsOptional()
  @IsString()
  @MaxLength(240)
  title = ''

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary = ''

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  imageUrl = ''

  @IsObject()
  content!: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  published = false

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder = 0
}

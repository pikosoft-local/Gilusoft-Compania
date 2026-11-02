import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class AdminUsernameLoginDto {
  @IsString()
  @Matches(/^[a-z0-9_]{3,24}$/)
  username!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}

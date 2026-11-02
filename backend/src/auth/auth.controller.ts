import { Body, Controller, Post } from '@nestjs/common'
import { AdminUsernameLoginDto } from './dto/admin-username-login.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/username')
  signInAdmin(@Body() input: AdminUsernameLoginDto) {
    return this.auth.signInAdmin(input.username, input.password)
  }
}

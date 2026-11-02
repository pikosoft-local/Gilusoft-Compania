import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'
import { SupabaseService } from '../supabase/supabase.service'
import type { AuthenticatedRequest } from './cms.types'

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { cmsUser?: AuthenticatedRequest['cmsUser'] }>()
    const authorization = request.headers.authorization
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) throw new UnauthorizedException('A Supabase access token is required.')

    const { data, error } = await this.supabase.admin.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException('The Supabase session is invalid or expired.')
    request.cmsUser = { id: data.user.id, email: data.user.email }
    return true
  }
}

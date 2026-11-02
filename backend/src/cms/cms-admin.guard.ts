import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { SupabaseService } from '../supabase/supabase.service'
import type { AuthenticatedRequest } from './cms.types'

@Injectable()
export class CmsAdminGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { cmsUser?: AuthenticatedRequest['cmsUser'] }>()
    const user = request.cmsUser
    if (!user) throw new ForbiddenException('Authentication is required.')

    const environmentAdmins = (this.config.get<string>('CMS_ADMIN_USER_IDS') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    if (environmentAdmins.includes(user.id)) return true

    const { data, error } = await this.supabase.admin
      .from('cms_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) this.supabase.reportDatabaseError('Could not verify CMS administrator access.', error)
    if (!data) throw new ForbiddenException('This account does not have CMS administrator access.')
    return true
  }
}

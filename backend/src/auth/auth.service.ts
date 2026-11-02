import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../supabase/supabase.service'

const invalidCredentialsMessage = 'Nieprawidłowy login lub hasło.'

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async signInAdmin(username: string, password: string) {
    const { data: profile, error: profileError } = await this.supabase.admin
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .maybeSingle()

    if (profileError) {
      this.supabase.reportDatabaseError('Could not look up administrator login.', profileError)
    }
    if (!profile) throw new UnauthorizedException(invalidCredentialsMessage)

    const { data: authData, error: authLookupError } = await this.supabase.admin.auth.admin
      .getUserById(profile.user_id)

    if (authLookupError) {
      this.supabase.reportDatabaseError('Could not load administrator authentication record.', authLookupError)
    }
    const email = authData.user.email
    if (!email) throw new UnauthorizedException(invalidCredentialsMessage)

    const { data: signInData, error: signInError } = await this.supabase.signInWithPassword(
      email,
      password,
    )
    if (signInError || !signInData.session) {
      throw new UnauthorizedException(invalidCredentialsMessage)
    }

    const environmentAdmins = (this.config.get<string>('CMS_ADMIN_USER_IDS') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (!environmentAdmins.includes(profile.user_id)) {
      const { data: adminRecord, error: adminError } = await this.supabase.admin
        .from('cms_admins')
        .select('user_id')
        .eq('user_id', profile.user_id)
        .maybeSingle()

      if (adminError) {
        this.supabase.reportDatabaseError('Could not verify CMS administrator access.', adminError)
      }
      if (!adminRecord) throw new UnauthorizedException(invalidCredentialsMessage)
    }

    return {
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      },
    }
  }
}

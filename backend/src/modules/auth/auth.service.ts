import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { get_supabase_client } from '../../lib/supabase.client';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class AuthService {
  private supabase = get_supabase_client();

  constructor(
    private jwt_service: JwtService,
    private users_service: UsersService,
  ) {}

  async handle_google_callback(google_user: any) {
    // Check if user exists by email
    let user = await this.users_service.find_by_email(google_user.email);

    if (!user) {
      // Create new user
      user = await this.users_service.create({
        email: google_user.email,
        name: google_user.name,
        avatar_url: google_user.avatar_url,
      });

      // Insert auth tokens
      await this.supabase.from('user_auth_tokens').insert({
        user_id: user.id,
        source: 'google',
        source_user_id: google_user.source_user_id,
        access_token: google_user.access_token,
        refresh_token: google_user.refresh_token,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
      });
    } else {
      // Update existing tokens
      await this.supabase
        .from('user_auth_tokens')
        .upsert({
          user_id: user.id,
          source: 'google',
          source_user_id: google_user.source_user_id,
          access_token: google_user.access_token,
          refresh_token: google_user.refresh_token,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('user_id', user.id)
        .eq('source', 'google');
    }

    // Generate JWT
    const payload = { id: user.id, email: user.email };
    const jwt_token = this.jwt_service.sign(payload);

    return {
      access_token: jwt_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };
  }

  async refresh_token(user_id: string, email: string) {
    const payload = { id: user_id, email };
    const jwt_token = this.jwt_service.sign(payload);

    return {
      access_token: jwt_token,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { get_supabase_client } from '../../lib/supabase.client';
import { UsersService } from '../users/services/users.service';
import { SessionService } from './services/session.service';

const OAUTH_TOKEN_EXPIRY_MS = 3600 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private supabase = get_supabase_client();

  constructor(
    private jwt_service: JwtService,
    private users_service: UsersService,
    private session_service: SessionService,
  ) {}

  async handle_google_callback(google_user: any) {
    this.logger.log(`Looking up user by email: ${google_user.email}`);

    let user = await this.users_service.find_by_email(google_user.email);

    if (!user) {
      this.logger.log(`New user detected, creating account for: ${google_user.email}`);

      user = await this.users_service.create({
        email: google_user.email,
        name: google_user.name,
        avatar_url: google_user.avatar_url,
      });

      this.logger.log(`User account created - ID: ${user.id}`);

      await this.supabase.from('user_auth_tokens').insert({
        user_id: user.id,
        source: 'google',
        source_user_id: google_user.source_user_id,
        access_token: google_user.access_token,
        refresh_token: google_user.refresh_token,
        expires_at: new Date(Date.now() + OAUTH_TOKEN_EXPIRY_MS).toISOString(),
      });

      this.logger.log(`Google OAuth tokens stored for user: ${user.id}`);
    } else {
      this.logger.log(`Existing user found - ID: ${user.id}, Email: ${user.email}`);

      await this.supabase
        .from('user_auth_tokens')
        .upsert({
          user_id: user.id,
          source: 'google',
          source_user_id: google_user.source_user_id,
          access_token: google_user.access_token,
          refresh_token: google_user.refresh_token,
          expires_at: new Date(Date.now() + OAUTH_TOKEN_EXPIRY_MS).toISOString(),
        })
        .eq('user_id', user.id)
        .eq('source', 'google');

      this.logger.log(`Google OAuth tokens updated for user: ${user.id}`);
    }

    // Create session in Redis
    const session_id = await this.session_service.create_session(user.id, user.email);

    const payload = { id: user.id, email: user.email, session_id };
    const jwt_token = this.jwt_service.sign(payload);

    this.logger.log(`JWT generated with session for user: ${user.email}`);

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

  async refresh_token(user_id: string, email: string, old_session_id: string) {
    this.logger.log(`Refreshing JWT for user: ${email} (${user_id})`);

    // Delete old session
    await this.session_service.delete_session(old_session_id);

    // Create new session
    const session_id = await this.session_service.create_session(user_id, email);

    const payload = { id: user_id, email, session_id };
    const jwt_token = this.jwt_service.sign(payload);

    this.logger.log(`JWT refreshed with new session for user: ${email}`);

    return {
      access_token: jwt_token,
    };
  }

  async logout(session_id: string): Promise<void> {
    await this.session_service.delete_session(session_id);
  }

  async logout_all(user_id: string): Promise<void> {
    await this.session_service.delete_all_user_sessions(user_id);
  }
}

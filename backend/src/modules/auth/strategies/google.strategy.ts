import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy');

  constructor(private config_service: ConfigService) {
    super({
      clientID: config_service.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config_service.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config_service.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
    this.logger.log('🔧 Google OAuth strategy initialized');
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    this.logger.log(`✅ Google OAuth validation successful for: ${emails[0].value}`);
    this.logger.debug(`Google profile - ID: ${id}, Name: ${displayName}`);

    const user = {
      source_user_id: id,
      email: emails[0].value,
      name: displayName,
      avatar_url: photos[0]?.value,
      access_token,
      refresh_token,
    };

    done(null, user);
  }
}

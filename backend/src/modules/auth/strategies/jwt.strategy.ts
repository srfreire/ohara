import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SessionService } from '../services/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config_service: ConfigService,
    private session_service: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: Extract from HttpOnly cookie
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        // Fallback: Extract from Authorization header (for backward compatibility)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config_service.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload.id || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Validate session exists in Redis
    if (payload.session_id) {
      const session = await this.session_service.validate_session(payload.session_id);

      if (!session) {
        throw new UnauthorizedException('Session expired or invalidated');
      }

      // Verify session belongs to the same user
      if (session.user_id !== payload.id) {
        throw new UnauthorizedException('Session mismatch');
      }
    }

    return { id: payload.id, email: payload.email, session_id: payload.session_id };
  }
}

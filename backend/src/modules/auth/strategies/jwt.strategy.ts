import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config_service: ConfigService) {
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

    return { id: payload.id, email: payload.email };
  }
}

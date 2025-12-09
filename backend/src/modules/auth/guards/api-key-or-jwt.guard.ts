import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '../services/session.service';

@Injectable()
export class ApiKeyOrJwtGuard implements CanActivate {
  constructor(
    private config_service: ConfigService,
    private jwt_service: JwtService,
    private session_service: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check for API key first
    const api_key = request.headers['x-api-key'];
    const valid_api_key = this.config_service.get<string>('ADMIN_API_KEY');

    if (api_key && api_key === valid_api_key) {
      request.user = { is_admin: true };
      return true;
    }

    // Check for JWT in cookie
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Missing authentication: provide x-api-key header or access_token cookie');
    }

    try {
      const payload = await this.jwt_service.verifyAsync(token, {
        secret: this.config_service.get<string>('JWT_SECRET'),
      });

      if (!payload.session_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const session = await this.session_service.validate_session(payload.session_id);

      if (!session) {
        throw new UnauthorizedException('Session expired or invalidated');
      }

      if (session.user_id !== payload.id) {
        throw new UnauthorizedException('Session mismatch');
      }

      request.user = { id: payload.id, email: payload.email, session_id: payload.session_id };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

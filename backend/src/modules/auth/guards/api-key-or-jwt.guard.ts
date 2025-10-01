import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApiKeyOrJwtGuard implements CanActivate {
  constructor(
    private config_service: ConfigService,
    private jwt_service: JwtService,
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

    // Check for JWT token
    const auth_header = request.headers.authorization;
    if (auth_header && auth_header.startsWith('Bearer ')) {
      const token = auth_header.substring(7);

      try {
        const payload = await this.jwt_service.verifyAsync(token, {
          secret: this.config_service.get<string>('JWT_SECRET'),
        });
        request.user = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired JWT token');
      }
    }

    throw new UnauthorizedException('Missing authentication: provide either x-api-key or Bearer token');
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config_service: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const api_key = request.headers['x-api-key'];

    const valid_api_key = this.config_service.get<string>('ADMIN_API_KEY');

    if (!api_key || api_key !== valid_api_key) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}

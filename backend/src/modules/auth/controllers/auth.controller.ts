import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { AuthService } from '../auth.service';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('v2/auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(
    private readonly auth_service: AuthService,
    private readonly config_service: ConfigService,
  ) {}

  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async login() {
    this.logger.log('Initiating Google OAuth login flow');
  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async callback(@Req() req: any, @Res() res: Response) {
    this.logger.log(`OAuth callback received for user: ${req.user?.email || 'unknown'}`);

    const result = await this.auth_service.handle_google_callback(req.user);

    const frontend_url = this.config_service.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const is_production = this.config_service.get<string>('NODE_ENV') === 'production';

    // Set JWT in HttpOnly cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: is_production, // HTTPS only in production
      sameSite: 'strict', // Maximum CSRF protection
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/',
    });

    this.logger.log(`JWT set in HttpOnly cookie for user: ${result.user.email}`);

    // Redirect with user info only (no token in URL)
    const avatar_param = result.user.avatar_url
      ? `&avatar_url=${encodeURIComponent(result.user.avatar_url)}`
      : '';
    const redirect_url = `${frontend_url}/?id=${result.user.id}&email=${encodeURIComponent(result.user.email || '')}&name=${encodeURIComponent(result.user.name || '')}${avatar_param}`;

    this.logger.log(`Redirecting user ${result.user.email} to frontend`);

    return res.redirect(redirect_url);
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req: any, @Res() res: Response) {
    this.logger.log(`Token refresh requested for user: ${req.user?.email || req.user?.id}`);

    const result = await this.auth_service.refresh_token(req.user.id, req.user.email);
    const is_production = this.config_service.get<string>('NODE_ENV') === 'production';

    // Set new JWT in HttpOnly cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: is_production,
      sameSite: 'strict', // Maximum CSRF protection
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/',
    });

    this.logger.log(`JWT refreshed and set in cookie for user: ${req.user.email}`);

    return res.json({ message: 'Token refreshed successfully' });
  }
}

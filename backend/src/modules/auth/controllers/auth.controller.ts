import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description:
      'Redirects to Google OAuth consent screen. After authentication, user is redirected to /auth/callback.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async login() {
    this.logger.log('🔐 Initiating Google OAuth login flow');
  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handles Google OAuth callback, creates/updates user, generates JWT, and redirects to frontend with tokens.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with access_token in query params',
  })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  async callback(@Req() req: any, @Res() res: Response) {
    this.logger.log(`📥 OAuth callback received for user: ${req.user?.email || 'unknown'}`);

    const result = await this.auth_service.handle_google_callback(req.user);

    // Get frontend URL from environment
    const frontend_url = this.config_service.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    // Redirect to frontend with tokens in query params
    const avatar_param = result.user.avatar_url
      ? `&avatar_url=${encodeURIComponent(result.user.avatar_url)}`
      : '';
    const redirect_url = `${frontend_url}/?access_token=${result.access_token}&id=${result.user.id}&email=${encodeURIComponent(result.user.email || '')}&name=${encodeURIComponent(result.user.name || '')}${avatar_param}`;

    this.logger.log(`🔄 Redirecting user ${result.user.email} to frontend`);

    return res.redirect(redirect_url);
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Generate a new JWT token using a valid existing token. Token expires in 7 days.',
  })
  @ApiResponse({
    status: 200,
    description: 'New JWT token generated',
    schema: { example: { access_token: 'jwt_token_string' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  async refresh(@Req() req: any) {
    this.logger.log(`🔄 Token refresh requested for user: ${req.user?.email || req.user?.id}`);
    return this.auth_service.refresh_token(req.user.id, req.user.email);
  }
}

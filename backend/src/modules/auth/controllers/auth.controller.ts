import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth_service: AuthService) {}

  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async login() {
    // Guard redirects to Google
  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async callback(@Req() req: any) {
    return this.auth_service.handle_google_callback(req.user);
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req: any) {
    return this.auth_service.refresh_token(req.user.id, req.user.email);
  }
}

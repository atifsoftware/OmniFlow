import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../core/decorators/public.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Throttle } from '../../core/security/throttle.decorator';

@ApiTags('Auth & Security')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(5, 60) // Maximum 5 attempts per minute per IP against brute force
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and obtain JWT bearer token & HttpOnly cookie' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('omniflow_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    return result;
  }

  @Public()
  @Throttle(3, 60) // Maximum 3 account creations per minute per IP against spam bots
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('omniflow_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return result;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Clear auth session and cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('omniflow_token', { path: '/' });
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}

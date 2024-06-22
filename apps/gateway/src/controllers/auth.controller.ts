import { Controller, Post, Body, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH') private readonly authClient: ClientProxy) {}

  @Post('login')
  async login(@Body() loginDto: any, @Res() response: Response) {
    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'login' }, loginDto),
    );

    // Set cookies for access and refresh tokens
    this.setTokensAsCookies(
      response,
      result.access_token,
      result.refresh_token,
    );

    // Send response
    response.status(200).json({ message: 'Login successful' });
  }

  @Post('register')
  async register(@Body() registerDto: any, @Res() response: Response) {
    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'register' }, registerDto),
    );

    // Set cookies for access and refresh tokens
    this.setTokensAsCookies(
      response,
      result.access_token,
      result.refresh_token,
    );

    // Send response
    response.status(200).json({ message: 'Registration successful' });
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: any, @Res() response: Response) {
    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'refresh_token' }, refreshTokenDto),
    );

    // Set cookie for the new access token
    this.setTokensAsCookies(response, result.access_token);

    // Send response
    response.status(200).json({ message: 'Token refreshed successfully' });
  }

  @Post('logout')
  async logout(@Res() response: Response) {
    this.clearCookies(response);
    response.status(200).json({ message: 'Logout successful' });
  }

  private setTokensAsCookies(
    response: Response,
    accessToken: string,
    refreshToken?: string,
  ) {
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure this is only set to true in production
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    if (refreshToken) {
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure this is only set to true in production
        maxAge: 3600 * 60 * 1000, // 60 hours
      });
    }
  }

  private clearCookies(response: Response) {
    response.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
    response.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
  }
}

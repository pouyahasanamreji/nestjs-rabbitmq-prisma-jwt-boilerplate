import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  RmqService,
  UnauthorizedException,
  ConflictException,
} from '@app/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {}

  async login(loginDto: any, context: RmqContext) {
    return this.handleTokenGenerationAndError(
      loginDto,
      'validate_user',
      context,
    );
  }

  async register(registerDto: any, context: RmqContext) {
    return this.handleTokenGenerationAndError(
      registerDto,
      'create_user',
      context,
    );
  }

  async refreshToken(refreshTokenDto: any, context: RmqContext) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newPayload = { sub: payload.sub, email: payload.email };
      const newTokens = {
        access_token: this.jwtService.sign(newPayload),
      };
      this.rmqService.ack(context);
      return newTokens;
    } catch (error) {
      this.rmqService.ack(context);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async handleTokenGenerationAndError(
    dto: any,
    cmd: string,
    context: RmqContext,
  ) {
    try {
      const user = await lastValueFrom(this.usersClient.send({ cmd }, dto));
      const payload = { sub: user.id, email: user.email };
      const tokens = {
        access_token: this.jwtService.sign(payload, {
          expiresIn: process.env.JWT_EXPIRATION,
        }),
        refresh_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRATION,
        }),
      };
      this.rmqService.ack(context);
      return tokens;
    } catch (error) {
      if (error.statusCode === 409) {
        this.rmqService.ack(context);
        throw new ConflictException('Email already exists.');
      } else if (error.statusCode === 401) {
        this.rmqService.ack(context);
        throw new UnauthorizedException('Credentials are not valid.');
      }

      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}

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
  UnprocessableEntityException,
  BadRequestException,
} from '@app/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
    @Inject('USERS') private readonly usersClient: ClientProxy,
    @Inject('CONFIGURATIONS')
    private readonly configurationsClient: ClientProxy,
  ) {}

  async getDefaultRoleId(): Promise<number> {
    const configuration = await lastValueFrom(
      this.configurationsClient.send(
        { cmd: 'get_configuration' },
        'default_role_id',
      ),
    );
    return parseInt(configuration.value, 10);
  }

  async login(loginDto: any, context: RmqContext) {
    return this.handleTokenGenerationAndError(
      loginDto,
      'validate_user',
      context,
    );
  }

  async register(registerDto: any, context: RmqContext) {
    const defaultRoleId = await this.getDefaultRoleId();
    const userDtoWithRole = { ...registerDto, roleId: defaultRoleId };
    return this.handleTokenGenerationAndError(
      userDtoWithRole,
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
      this.handleError(error, context);
    }
  }

  private handleError(error: any, context: RmqContext): never {
    const knownErrors = [409, 401, 422, 400];

    if (knownErrors.includes(error.statusCode)) {
      this.rmqService.ack(context);
    }

    console.log(error);

    if (error.statusCode === 409) {
      throw new ConflictException(error.message);
    } else if (error.statusCode === 401) {
      throw new UnauthorizedException(error.message);
    } else if (error.statusCode === 422) {
      throw new UnprocessableEntityException(error.message);
    } else if (error.statusCode === 400) {
      throw new BadRequestException(error.message);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('An unexpected error occurred.');
  }
}

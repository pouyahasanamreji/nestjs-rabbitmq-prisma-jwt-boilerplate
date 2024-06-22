import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RmqService } from '@app/common';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any, @Ctx() context: RmqContext) {
    const result = await this.authService.login(data, context);
    return result;
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: any, @Ctx() context: RmqContext) {
    const result = await this.authService.register(data, context);
    return result;
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(@Payload() data: any, @Ctx() context: RmqContext) {
    const result = await this.authService.refreshToken(data, context);
    return result;
  }
}

import { RpcException } from '@nestjs/microservices';

export class UnauthorizedException extends RpcException {
  constructor(message: string) {
    super({ statusCode: 401, message });
  }
}

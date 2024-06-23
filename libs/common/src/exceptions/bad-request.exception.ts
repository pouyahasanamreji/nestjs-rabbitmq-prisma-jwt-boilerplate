import { RpcException } from '@nestjs/microservices';

export class BadRequestException extends RpcException {
  constructor(message: string) {
    super({ statusCode: 400, message });
  }
}

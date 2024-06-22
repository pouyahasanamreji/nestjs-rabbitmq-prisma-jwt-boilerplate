import { RpcException } from '@nestjs/microservices';

export class ConflictException extends RpcException {
  constructor(message: string) {
    super({ statusCode: 409, message });
  }
}

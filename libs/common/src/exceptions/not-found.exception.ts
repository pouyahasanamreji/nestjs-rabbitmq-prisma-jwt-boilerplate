import { RpcException } from '@nestjs/microservices';

export class NotFoundException extends RpcException {
  constructor(message: string) {
    super({ statusCode: 404, message });
  }
}

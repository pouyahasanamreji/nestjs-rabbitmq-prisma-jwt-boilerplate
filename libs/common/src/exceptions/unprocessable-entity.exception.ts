import { RpcException } from '@nestjs/microservices';

export class UnprocessableEntityException extends RpcException {
  constructor(message: string) {
    super({ statusCode: 422, message });
  }
}

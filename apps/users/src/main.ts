import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  app.useGlobalPipes(new ValidationPipe());
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('USERS'));
  await app.startAllMicroservices();
}
bootstrap();

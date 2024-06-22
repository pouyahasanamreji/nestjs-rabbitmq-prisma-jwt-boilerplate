import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { AuthModule } from './auth.module';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('AUTH'));
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
}
bootstrap();

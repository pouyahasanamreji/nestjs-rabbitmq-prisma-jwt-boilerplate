import { NestFactory } from '@nestjs/core';
import { AuthorizationModule } from './authorization.module';
import { ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthorizationModule);
  app.useGlobalPipes(new ValidationPipe());
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTHORIZATION'));
  await app.startAllMicroservices();
}
bootstrap();

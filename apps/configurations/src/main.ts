import { NestFactory } from '@nestjs/core';
import { ConfigurationsModule } from './configurations.module';
import { ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ConfigurationsModule);
  app.useGlobalPipes(new ValidationPipe());
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('CONFIGURATIONS'));
  await app.startAllMicroservices();
}
bootstrap();

import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigurationsController } from './configurations.controller';
import { ConfigurationsService } from './configurations.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_CONFIGURATIONS_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/configurations/.env',
    }),
    DatabaseModule,
    RmqModule.register({
      name: 'CONFIGURATIONS',
    }),
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService, Logger],
})
export class ConfigurationsModule {}

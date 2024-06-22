import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_USERS_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/users/.env',
    }),
    DatabaseModule,
    RmqModule.register({
      name: 'USERS',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, Logger],
})
export class UsersModule {}

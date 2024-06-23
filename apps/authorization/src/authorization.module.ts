import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTHORIZATION_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/authorization/.env',
    }),
    DatabaseModule,
    RmqModule.register({
      name: 'AUTHORIZATION',
    }),
  ],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService, Logger],
})
export class AuthorizationModule {}

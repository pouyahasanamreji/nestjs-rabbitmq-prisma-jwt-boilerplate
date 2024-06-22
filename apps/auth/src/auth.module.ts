import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RmqModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_USERS_QUEUE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    PassportModule,
    RmqModule.register({
      name: 'USERS',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Logger],
})
export class AuthModule {}

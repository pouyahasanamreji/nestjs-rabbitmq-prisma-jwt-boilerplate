import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { PermissionGuard } from './permission.guard';
import { Permissions } from './permission.decorator';
import { RmqModule } from '../rmq/rmq.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RmqModule.register({
      name: 'USERS',
    }),
  ],
  providers: [AuthGuard, PermissionGuard],
  exports: [AuthGuard, PermissionGuard, JwtModule],
})
export class AuthModule {}

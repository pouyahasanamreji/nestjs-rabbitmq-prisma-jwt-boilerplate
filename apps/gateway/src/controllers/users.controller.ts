import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from '@app/common/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const users = await lastValueFrom(
      this.usersClient.send({ cmd: 'get_all_users' }, {}),
    );
    return users;
  }
}

import { Controller, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Permissions } from '@app/common';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  @Get()
  @Permissions('read_users')
  async findAll() {
    const users = await lastValueFrom(
      this.usersClient.send({ cmd: 'get_all_users' }, {}),
    );
    return users;
  }
}

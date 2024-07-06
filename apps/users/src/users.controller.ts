import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  async create(
    @Payload() createUserDto: CreateUserDto,
    @Ctx() context: RmqContext,
  ) {
    return this.usersService.create(createUserDto, context);
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async findAll(
    @Payload() data: { page?: number; limit?: number },
    @Ctx() context: RmqContext,
  ) {
    const { page = 1, limit = 10 } = data;
    return this.usersService.findAll(page, limit, context);
  }

  @MessagePattern({ cmd: 'get_user' })
  async findOne(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.usersService.findOne(id, context);
  }

  @MessagePattern({ cmd: 'update_user' })
  async update(
    @Payload() data: { id: number; updateUserDto: UpdateUserDto },
    @Ctx() context: RmqContext,
  ) {
    const { id, updateUserDto } = data;
    return this.usersService.update(id, updateUserDto, context);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async remove(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.usersService.remove(id, context);
  }

  @MessagePattern({ cmd: 'validate_user' })
  async validateUser(
    @Payload() data: { email: string; password: string },
    @Ctx() context: RmqContext,
  ) {
    const { email, password } = data;
    return this.usersService.validateUser(email, password, context);
  }

  @MessagePattern({ cmd: 'get_user_permissions' })
  async getUserPermissions(
    @Payload() userId: number,
    @Ctx() context: RmqContext,
  ) {
    return this.usersService.getUserPermissions(userId, context);
  }
}

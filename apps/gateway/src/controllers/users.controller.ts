import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthGuard, Permissions, PermissionGuard } from '@app/common';
import { CreateUserDto, UpdateUserDto } from '../dto/users/user.dto';
import {
  CreateUserResponseDto,
  UpdateUserResponseDto,
  DeleteUserResponseDto,
  PaginatedUserResponseDto,
  UserResponseDto,
  UserPermissionsResponseDto,
} from '../dto/users/user-response.dto';

@Controller('users')
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
  constructor(@Inject('USERS') private readonly usersClient: ClientProxy) {}

  @Post()
  @Permissions('create_user')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return lastValueFrom(
      this.usersClient.send<CreateUserResponseDto>(
        { cmd: 'create_user' },
        createUserDto,
      ),
    );
  }

  @Get()
  @Permissions('read_users')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedUserResponseDto> {
    return lastValueFrom(
      this.usersClient.send<PaginatedUserResponseDto>(
        { cmd: 'get_all_users' },
        { page, limit },
      ),
    );
  }

  @Get(':id')
  @Permissions('read_users')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return lastValueFrom(
      this.usersClient.send<UserResponseDto>({ cmd: 'get_user' }, parseInt(id)),
    );
  }

  @Put(':id')
  @Permissions('update_users')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return lastValueFrom(
      this.usersClient.send<UpdateUserResponseDto>(
        { cmd: 'update_user' },
        { id: parseInt(id), updateUserDto },
      ),
    );
  }

  @Delete(':id')
  @Permissions('delete_users')
  async remove(@Param('id') id: string): Promise<DeleteUserResponseDto> {
    return lastValueFrom(
      this.usersClient.send<DeleteUserResponseDto>(
        { cmd: 'delete_user' },
        parseInt(id),
      ),
    );
  }

  @Get(':id/permissions')
  @Permissions('read_users')
  async getUserPermissions(
    @Param('id') id: string,
  ): Promise<UserPermissionsResponseDto> {
    return lastValueFrom(
      this.usersClient.send<UserPermissionsResponseDto>(
        { cmd: 'get_user_permissions' },
        parseInt(id),
      ),
    );
  }
}

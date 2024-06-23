import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @MessagePattern({ cmd: 'create_permission' })
  async create(
    @Payload() createPermissionDto: CreatePermissionDto,
    @Ctx() context: RmqContext,
  ) {
    return this.permissionsService.create(createPermissionDto, context);
  }

  @MessagePattern({ cmd: 'get_all_permissions' })
  async findAll(@Ctx() context: RmqContext) {
    return this.permissionsService.findAll(context);
  }

  @MessagePattern({ cmd: 'get_permission' })
  async findOne(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.permissionsService.findOne(id, context);
  }

  @MessagePattern({ cmd: 'update_permission' })
  async update(
    @Payload() data: { id: number; updatePermissionDto: UpdatePermissionDto },
    @Ctx() context: RmqContext,
  ) {
    const { id, updatePermissionDto } = data;
    return this.permissionsService.update(id, updatePermissionDto, context);
  }

  @MessagePattern({ cmd: 'delete_permission' })
  async remove(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.permissionsService.remove(id, context);
  }
}

import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern({ cmd: 'create_role' })
  async create(
    @Payload() createRoleDto: CreateRoleDto,
    @Ctx() context: RmqContext,
  ) {
    return this.rolesService.create(createRoleDto, context);
  }

  @MessagePattern({ cmd: 'get_all_roles' })
  async findAll(@Ctx() context: RmqContext) {
    return this.rolesService.findAll(context);
  }

  @MessagePattern({ cmd: 'get_role' })
  async findOne(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.rolesService.findOne(id, context);
  }

  @MessagePattern({ cmd: 'update_role' })
  async update(
    @Payload() data: { id: number; updateRoleDto: UpdateRoleDto },
    @Ctx() context: RmqContext,
  ) {
    const { id, updateRoleDto } = data;
    return this.rolesService.update(id, updateRoleDto, context);
  }

  @MessagePattern({ cmd: 'delete_role' })
  async remove(@Payload() id: number, @Ctx() context: RmqContext) {
    return this.rolesService.remove(id, context);
  }
}

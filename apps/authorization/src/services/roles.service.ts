import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConflictException, DatabaseService, RmqService } from '@app/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
  ) {}

  async create(createRoleDto: CreateRoleDto, context: RmqContext) {
    try {
      const role = await this.prisma.role.create({
        data: createRoleDto,
      });
      this.rmqService.ack(context);
      return role;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.rmqService.ack(context);
        throw new ConflictException('Role already exists.');
      }
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(context: RmqContext) {
    const roles = await this.prisma.role.findMany();
    this.rmqService.ack(context);
    return roles;
  }

  async findOne(id: number, context: RmqContext) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    this.rmqService.ack(context);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, context: RmqContext) {
    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    this.rmqService.ack(context);
    return updatedRole;
  }

  async remove(id: number, context: RmqContext) {
    const deletedRole = await this.prisma.role.delete({ where: { id } });
    this.rmqService.ack(context);
    return deletedRole;
  }
}

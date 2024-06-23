import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConflictException, DatabaseService, RmqService } from '@app/common';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, context: RmqContext) {
    try {
      const permission = await this.prisma.permission.create({
        data: createPermissionDto,
      });
      this.rmqService.ack(context);
      return permission;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.rmqService.ack(context);
        throw new ConflictException('Permission already exists.');
      }
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(context: RmqContext) {
    const permissions = await this.prisma.permission.findMany();
    this.rmqService.ack(context);
    return permissions;
  }

  async findOne(id: number, context: RmqContext) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    this.rmqService.ack(context);
    return permission;
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
    context: RmqContext,
  ) {
    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
    this.rmqService.ack(context);
    return updatedPermission;
  }

  async remove(id: number, context: RmqContext) {
    const deletedPermission = await this.prisma.permission.delete({
      where: { id },
    });
    this.rmqService.ack(context);
    return deletedPermission;
  }
}

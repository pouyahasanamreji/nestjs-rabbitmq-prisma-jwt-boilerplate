import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ConflictException,
  DatabaseService,
  RmqService,
  UnauthorizedException,
  UnprocessableEntityException,
  BadRequestException,
} from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto, context: RmqContext) {
    try {
      // Validate roleIds presence
      if (!createUserDto.roleId) {
        throw new BadRequestException(
          'Role ID must be provided and must be a number.',
        );
      }

      // Check if all provided role IDs exist
      const existingRole = await this.prisma.role.findUnique({
        where: { id: createUserDto.roleId },
      });

      if (!existingRole) {
        throw new UnprocessableEntityException(
          'The provided role does not exist.',
        );
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create the user in the database, including their role
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          name: createUserDto.name,
          roleId: createUserDto.roleId,
        },
      });

      // Acknowledge the RabbitMQ context
      this.rmqService.ack(context);

      // Return the created user
      return user;
    } catch (error) {
      // Handle custom exceptions
      if (error instanceof RpcException) {
        this.rmqService.ack(context);
        throw error;
      }

      // Handle unique constraint violation for email
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.rmqService.ack(context);
        throw new ConflictException('Email already exists.');
      }

      // Log any other errors and throw an internal server error
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(context: RmqContext) {
    const users = await this.prisma.user.findMany();
    this.rmqService.ack(context);
    return users;
  }

  async findOne(id: number, context: RmqContext) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    this.rmqService.ack(context);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, context: RmqContext) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    this.rmqService.ack(context);
    return updatedUser;
  }

  async remove(id: number, context: RmqContext) {
    const deletedUser = await this.prisma.user.delete({ where: { id } });
    this.rmqService.ack(context);
    return deletedUser;
  }

  async validateUser(email: string, password: string, context: RmqContext) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      this.rmqService.ack(context);
      return user;
    } catch (error) {
      if (
        error instanceof RpcException &&
        typeof error.getError() === 'object' &&
        (error.getError() as { statusCode: number; message: string })
          .statusCode === 401
      ) {
        this.rmqService.ack(context);
        throw error;
      }

      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async getUserPermissions(userId: number, context: RmqContext) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              RolePermission: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      const permissions = user.role.RolePermission.map(
        (rp) => rp.permission.name,
      );

      this.rmqService.ack(context);
      return { permissions };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}

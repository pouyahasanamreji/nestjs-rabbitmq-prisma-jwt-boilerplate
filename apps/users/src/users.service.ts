import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DatabaseService,
  RmqService,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
  BadRequestException,
  NotFoundException,
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
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      };
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

  async findAll(page = 1, limit = 10, context: RmqContext) {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            roleId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.user.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.rmqService.ack(context);
      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.handleError(error, context);
    }
  }

  async findOne(id: number, context: RmqContext) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      this.rmqService.ack(context);
      return user;
    } catch (error) {
      this.handleError(error, context);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, context: RmqContext) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (updateUserDto.roleId) {
        const existingRole = await this.prisma.role.findUnique({
          where: { id: updateUserDto.roleId },
        });
        if (!existingRole) {
          throw new UnprocessableEntityException(
            'The provided role does not exist.',
          );
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
        },
      });

      this.rmqService.ack(context);
      return updatedUser;
    } catch (error) {
      this.handleError(error, context);
    }
  }

  async remove(id: number, context: RmqContext) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      const deletedUser = await this.prisma.user.delete({ where: { id } });
      this.rmqService.ack(context);
      return {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name,
        roleId: deletedUser.roleId,
      };
    } catch (error) {
      this.handleError(error, context);
    }
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
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      };
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

  private handleError(error: any, context: RmqContext): never {
    this.rmqService.ack(context);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
    }

    if (
      error instanceof ConflictException ||
      error instanceof UnauthorizedException ||
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof UnprocessableEntityException
    ) {
      throw error;
    }

    this.logger.error(error);
    throw new UnprocessableEntityException('An unexpected error occurred.');
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ConflictException,
  DatabaseService,
  RmqService,
  UnauthorizedException,
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
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      this.rmqService.ack(context);
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.rmqService.ack(context);
        throw new ConflictException('Email already exists.');
      }
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
        this.rmqService.ack(context);
        throw new UnauthorizedException('Credentials are not valid.');
      }
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        this.rmqService.ack(context);
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
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}

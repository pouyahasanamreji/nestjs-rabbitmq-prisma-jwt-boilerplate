import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService, RmqService } from '@app/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class ConfigurationsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly rmqService: RmqService,
    private readonly logger: Logger,
  ) {}

  async create(
    createConfigurationDto: CreateConfigurationDto,
    context: RmqContext,
  ) {
    try {
      const configuration = await this.prisma.configuration.create({
        data: createConfigurationDto,
      });
      this.rmqService.ack(context);
      return configuration;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(context: RmqContext) {
    try {
      const configurations = await this.prisma.configuration.findMany();
      this.rmqService.ack(context);
      return configurations;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findOne(key: string, context: RmqContext) {
    try {
      const configuration = await this.prisma.configuration.findUnique({
        where: { key },
      });
      if (!configuration) {
        throw new NotFoundException(
          `Configuration with key "${key}" not found.`,
        );
      }
      this.rmqService.ack(context);
      return configuration;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async update(
    key: string,
    updateConfigurationDto: UpdateConfigurationDto,
    context: RmqContext,
  ) {
    try {
      const configuration = await this.prisma.configuration.findUnique({
        where: { key },
      });
      if (!configuration) {
        throw new NotFoundException(
          `Configuration with key "${key}" not found.`,
        );
      }
      const updatedConfiguration = await this.prisma.configuration.update({
        where: { key },
        data: updateConfigurationDto,
      });
      this.rmqService.ack(context);
      return updatedConfiguration;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async remove(key: string, context: RmqContext) {
    try {
      const configuration = await this.prisma.configuration.findUnique({
        where: { key },
      });
      if (!configuration) {
        throw new NotFoundException(
          `Configuration with key "${key}" not found.`,
        );
      }
      const deletedConfiguration = await this.prisma.configuration.delete({
        where: { key },
      });
      this.rmqService.ack(context);
      return deletedConfiguration;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}

import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Controller()
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @MessagePattern({ cmd: 'create_configuration' })
  create(
    @Payload() createConfigurationDto: CreateConfigurationDto,
    @Ctx() context: RmqContext,
  ) {
    return this.configurationsService.create(createConfigurationDto, context);
  }

  @MessagePattern({ cmd: 'get_all_configurations' })
  findAll(@Ctx() context: RmqContext) {
    return this.configurationsService.findAll(context);
  }

  @MessagePattern({ cmd: 'get_configuration' })
  findOne(@Payload() key: string, @Ctx() context: RmqContext) {
    return this.configurationsService.findOne(key, context);
  }

  @MessagePattern({ cmd: 'update_configuration' })
  update(
    @Payload()
    data: { key: string; updateConfigurationDto: UpdateConfigurationDto },
    @Ctx() context: RmqContext,
  ) {
    const { key, updateConfigurationDto } = data;
    return this.configurationsService.update(
      key,
      updateConfigurationDto,
      context,
    );
  }

  @MessagePattern({ cmd: 'delete_configuration' })
  remove(@Payload() key: string, @Ctx() context: RmqContext) {
    return this.configurationsService.remove(key, context);
  }
}

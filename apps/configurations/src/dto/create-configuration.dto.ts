import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigurationDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Base response DTO
export class BaseResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  message?: string;
}

// Error response DTO
export class ErrorResponseDto extends BaseResponseDto {
  @IsString()
  error: string;

  @IsNumber()
  statusCode: number;
}

// User DTO (used in other response DTOs)
export class UserDto {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  roleId: number;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;
}

// Single user response DTO
export class UserResponseDto extends BaseResponseDto {
  @IsObject()
  @Type(() => UserDto)
  data: UserDto;
}

// Pagination metadata DTO
export class PaginationMetaDto {
  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  totalPages: number;
}

// Paginated data DTO
export class PaginatedDataDto {
  @IsArray()
  @Type(() => UserDto)
  users: UserDto[];

  @IsObject()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}

// Paginated user response DTO
export class PaginatedUserResponseDto extends BaseResponseDto {
  @IsObject()
  @Type(() => PaginatedDataDto)
  data: PaginatedDataDto;
}

// User permissions response DTO
export class UserPermissionsDto {
  @IsNumber()
  userId: number;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UserPermissionsResponseDto extends BaseResponseDto {
  @IsObject()
  @Type(() => UserPermissionsDto)
  data: UserPermissionsDto;
}

// Create user response DTO
export class CreateUserResponseDto extends UserResponseDto {}

// Update user response DTO
export class UpdateUserResponseDto extends UserResponseDto {}

// Delete user data DTO
export class DeleteUserDataDto {
  @IsNumber()
  id: number;

  @IsString()
  message: string;
}

// Delete user response DTO
export class DeleteUserResponseDto extends BaseResponseDto {
  @IsObject()
  @Type(() => DeleteUserDataDto)
  data: DeleteUserDataDto;
}

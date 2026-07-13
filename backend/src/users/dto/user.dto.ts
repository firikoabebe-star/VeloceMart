import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { Role } from '../../../generated/prisma/enums.js';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}

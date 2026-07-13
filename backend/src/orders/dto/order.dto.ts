import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { OrderStatus } from '../../../generated/prisma/enums.js';

export class OrderFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

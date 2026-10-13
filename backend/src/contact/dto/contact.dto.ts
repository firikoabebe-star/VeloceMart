import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Inquiry categories the contact form supports. Kept intentionally small and
 * aligned with the topics the help center covers.
 */
export enum ContactCategory {
  GENERAL = 'GENERAL',
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  ACCOUNT = 'ACCOUNT',
  TECHNICAL = 'TECHNICAL',
  PRIVACY = 'PRIVACY',
}

const trim = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ContactMessageDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => trim(value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsEnum(ContactCategory)
  category!: ContactCategory;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  subject!: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  orderReference?: string;
}

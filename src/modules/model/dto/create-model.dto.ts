import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { toCents } from 'src/common/utils/currency.util';

export class CreateModelVariantDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  color?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  size?: string;

  @IsNumber()
  @Transform(({ value }) => (value ? toCents(value) : undefined))
  costPrice: number;

  @IsNumber()
  @Transform(({ value }) => (value ? toCents(value) : undefined))
  salePrice: number;

  @IsInt()
  quantity: number;
}

export class CreateModelBodyDto {
  @IsString()
  @IsIn(['simple', 'variable'])
  type: 'simple' | 'variable';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? toCents(value) : undefined))
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? toCents(value) : undefined))
  salePrice?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateModelVariantDto)
  variants: CreateModelVariantDto[];
}

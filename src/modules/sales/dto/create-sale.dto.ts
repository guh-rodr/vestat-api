import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { toCents } from 'src/common/utils/currency.util';
import { CreateInstallmentBodyDto } from './create-installment.dto';

class SaleItem {
  @ApiProperty({ description: 'ID do modelo (CUID)', example: 'cmlvoby7y000...' })
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiProperty({ description: 'ID da variante (CUID)', example: 'cmlvoby7y000...' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ description: 'Preço de venda', example: 230 })
  @IsNumber()
  @Transform(({ value }) => toCents(value))
  salePrice: number;
}

export class CreateSaleBodyDto {
  @ApiProperty({ description: 'ID do cliente (CUID)', example: 'ch72gsb32000...' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ description: 'Data da compra', example: '2026-01-16' })
  @IsNotEmpty()
  @IsISO8601({ strict: true })
  purchasedAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItem)
  items: SaleItem[];

  @ApiProperty({ description: 'Dados da parcela (opcional)', required: false })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInstallmentBodyDto)
  installment: CreateInstallmentBodyDto | null;
}

import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { CreateProductBodyDto, CreateProductVariantDto } from './create-product.dto';

export class UpdateProductVariantDto extends CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsIn(['added', 'removed', 'modified'])
  status: 'added' | 'removed' | 'modified';
}

export class UpdateProductBodyDto extends PartialType(CreateProductBodyDto) {
  variants: UpdateProductVariantDto[];
}

import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { CreateModelBodyDto, CreateModelVariantDto } from './create-model.dto';

export class UpdateModelVariantDto extends CreateModelVariantDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsIn(['added', 'removed', 'modified'])
  status: 'added' | 'removed' | 'modified';
}

export class UpdateModelBodyDto extends PartialType(CreateModelBodyDto) {
  variants: UpdateModelVariantDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class DeleteManyCustomerBodyDto {
  @ApiProperty({ example: ['ch72gsb32000...', 'ckqtls704000...'], description: 'IDs dos clientes' })
  @IsArray()
  ids: string[];
}

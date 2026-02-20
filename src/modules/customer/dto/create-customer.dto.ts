import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerBodyDto {
  @ApiProperty({ example: 'Gustavo Rodrigues', description: 'Nome completo do cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '99 99999-9999', description: 'Telefone do cliente' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Prefere atendimento via Whatsapp', description: 'Observação geral' })
  @IsString()
  @IsOptional()
  note?: string;
}

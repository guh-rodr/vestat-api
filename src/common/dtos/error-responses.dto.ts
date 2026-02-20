import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Erro ao validar os campos' })
  message: string;

  @ApiProperty({ example: 'ValidationError' })
  error: string;

  @ApiProperty({
    example: {
      email: ['email deve ser um e-mail válido'],
      name: ['name não pode ser vazio'],
    },
  })
  validation: Record<string, string[]>;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'TokenInvalid', enum: ['TokenInvalid', 'TokenExpired'] })
  error: 'TokenInvalid' | 'TokenExpired';

  @ApiProperty({ example: 'Token inválido ou expirado' })
  message: string;
}

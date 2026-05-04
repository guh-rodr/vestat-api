import { IsArray, IsString } from 'class-validator';

export class BulkDeleteProductsBodyDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

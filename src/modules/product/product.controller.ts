import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProductBodyDto } from './dto/create-product.dto';
import { UpdateProductBodyDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('/:id/variants')
  findVariants(@Param('id') id: string) {
    return this.productService.findVariants(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Post()
  create(@Body() body: CreateProductBodyDto) {
    return this.productService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductBodyDto) {
    return this.productService.update(id, body);
  }
}

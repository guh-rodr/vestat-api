import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateModelBodyDto } from './dto/create-model.dto';
import { UpdateModelBodyDto } from './dto/update-model.dto';
import { ModelService } from './model.service';

@Controller('/models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('/:id/variants')
  findVariants(@Param('id') modelId: string) {
    return this.modelService.findVariants(modelId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.modelService.delete(id);
  }

  @Post()
  create(@Body() body: CreateModelBodyDto) {
    return this.modelService.create(body);
  }

  @Patch(':id')
  update(@Param('id') modelId: string, @Body() body: UpdateModelBodyDto) {
    return this.modelService.update(modelId, body);
  }
}

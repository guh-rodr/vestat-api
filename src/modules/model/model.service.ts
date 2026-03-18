import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateModelBodyDto } from './dto/create-model.dto';
import { UpdateModelBodyDto } from './dto/update-model.dto';

@Injectable()
export class ModelService {
  constructor(private prisma: PrismaService) {}

  async create(category: string, data: CreateModelBodyDto) {
    const isVariable = data.variants.length > 0;

    if (isVariable) {
      await this.prisma.model.create({
        data: {
          name: data.name,
          isVariable: true,
          variants: {
            createMany: {
              data: data.variants,
            },
          },
          category: {
            connectOrCreate: {
              where: { id: category },
              create: { name: category },
            },
          },
        },
      });
    } else {
      const defaultVariant = {
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        quantity: data.quantity,
      };

      await this.prisma.model.create({
        data: {
          name: data.name,
          variants: {
            create: defaultVariant,
          },
          category: {
            connectOrCreate: {
              where: { id: category },
              create: { name: category },
            },
          },
        },
      });
    }
  }

  async update(categoryId: string, modelId: string, data: UpdateModelBodyDto) {
    const { _count, ...model } = await this.prisma.model.update({
      where: {
        categoryId,
        id: modelId,
      },
      data,
      select: this.modelSelect,
    });

    const result = {
      ...model,
      itemCount: _count.items,
    };

    return result;
  }

  async delete(id: string) {
    const model = await this.prisma.model.delete({ where: { id } });

    return model;
  }
}

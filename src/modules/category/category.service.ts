import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryBodyDto } from './dto/create-category.dto';
import { UpdateCategoryBodyDto } from './dto/update-category.dto';

interface ListParams {
  search?: string;
  fetchModels?: boolean;
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryBodyDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: data.name,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }

      throw error;
    }
  }

  async listAutocomplete(search: string, fetchModels: boolean) {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: search,
            },
          },
          {
            models: {
              some: { name: { startsWith: search } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        models: fetchModels
          ? {
              select: { id: true, name: true, costPrice: true, salePrice: true },
            }
          : undefined,
      },
      take: 5,
    });

    return categories;
  }

  async list({ search = '' }: ListParams) {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { name: { startsWith: search } },
          {
            models: {
              some: { name: { startsWith: search } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        models: {
          select: {
            id: true,
            name: true,
            categoryId: true,
            isVariable: true,
            variants: {
              select: {
                id: true,
                color: true,
                size: true,
                costPrice: true,
                salePrice: true,
                quantity: true,
                _count: { select: { saleItems: true } },
              },
            },
          },
        },
      },
    });

    const result = categories.map((category) => ({
      ...category,
      models: category.models.map(({ variants, ...model }) => {
        if (model.isVariable) {
          const variantsWithoutCount = variants.map(({ _count, ...v }) => v);
          const itemCount = variants.reduce((prev, curr) => prev + curr._count.saleItems, 0);

          return {
            ...model,
            itemCount,
            variants: variantsWithoutCount,
          };
        } else {
          const { costPrice, salePrice, quantity, _count } = variants[0];
          const itemCount = _count.saleItems;

          return {
            ...model,
            itemCount,
            costPrice,
            salePrice,
            quantity,
          };
        }
      }),
    }));

    return result;
  }

  async delete(id: string) {
    const category = await this.prisma.category.delete({ where: { id } });

    return category;
  }

  async update(id: string, data: UpdateCategoryBodyDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
      },
    });

    return category;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/browser';
import { PrismaClient } from 'generated/prisma/client';
import { DateTime } from 'luxon';
import { PrismaService } from 'src/prisma.service';
import * as util from 'util';
import { CreateModelBodyDto, CreateModelVariantDto } from './dto/create-model.dto';
import { UpdateModelBodyDto, UpdateModelVariantDto } from './dto/update-model.dto';

@Injectable()
export class ModelService {
  constructor(private prisma: PrismaService) {}

  static readonly modelSelectFields = {
    id: true,
    name: true,
    categoryId: true,
    isVariable: true,
    variants: {
      where: { deletedAt: null },
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
  } satisfies Prisma.ModelSelect;

  private toModelDto(model: Prisma.ModelGetPayload<{ select: typeof ModelService.modelSelectFields }>) {
    if (model.isVariable) {
      const variantsWithoutCount = model.variants.map(({ _count, ...v }) => ({
        ...v,
        hasSales: _count.saleItems > 0,
      }));
      const itemCount = model.variants.reduce((prev, curr) => prev + curr._count.saleItems, 0);

      return {
        ...model,
        itemCount,
        variants: variantsWithoutCount,
      };
    } else {
      const { costPrice, salePrice, quantity, _count } = model.variants[0];
      const itemCount = _count.saleItems;

      return {
        ...model,
        itemCount,
        costPrice,
        salePrice,
        quantity,
      };
    }
  }

  async create({ categoryId, ...data }: CreateModelBodyDto) {
    const isVariable = data.type === 'variable';

    const variants = isVariable
      ? data.variants
      : [
          {
            costPrice: data.costPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
          },
        ];

    const model = await this.prisma.$transaction(async (tx) => {
      const newModel = await tx.model.create({
        data: {
          name: data.name,
          isVariable,
          categoryId,
        },
        select: ModelService.modelSelectFields,
      });

      const newVariants = [];

      for (const v of variants) {
        const newVariant = await this.createVariant(newModel.id, v, tx);

        newVariants.push(newVariant);
      }

      return {
        ...newModel,
        variants: newVariants,
      };
    });

    return this.toModelDto(model);
  }

  private async createVariant(
    modelId: string,
    variant: CreateModelVariantDto,
    prismaClient: Prisma.TransactionClient | PrismaClient = this.prisma,
  ) {
    return await prismaClient.modelVariant.upsert({
      where: {
        modelId_color_size: {
          modelId,
          color: variant.color || '',
          size: variant.size || '',
        },
      },
      update: {
        deletedAt: null,
        quantity: variant.quantity,
        costPrice: variant.costPrice,
        salePrice: variant.salePrice,
      },
      create: {
        modelId,
        ...variant,
      },
      select: ModelService.modelSelectFields.variants.select,
    });
  }

  private async updateVariant(
    id: string,
    variant: Partial<UpdateModelVariantDto>,
    prismaClient: Prisma.TransactionClient | PrismaClient = this.prisma,
  ) {
    await prismaClient.modelVariant.update({
      where: { id },
      data: variant,
    });
  }

  private async removeVariant(id: string, prismaClient: Prisma.TransactionClient | PrismaClient = this.prisma) {
    const foundVariant = await prismaClient.modelVariant.findFirstOrThrow({
      where: { id: id },
      select: { quantity: true, _count: { select: { saleItems: true } } },
    });

    if (foundVariant._count.saleItems > 0) {
      const currentDate = DateTime.now().setZone('America/Sao_Paulo').toJSDate();

      await prismaClient.modelVariant.update({
        where: { id: id },
        data: {
          deletedAt: currentDate,
          quantity: 0,
        },
      });
    } else {
      await prismaClient.modelVariant.delete({
        where: { id: id },
      });
    }
  }

  async update(modelId: string, data: UpdateModelBodyDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const foundModel = await tx.model.findFirstOrThrow({
        where: { id: modelId },
        select: {
          isVariable: true,
          variants: { select: { id: true, costPrice: true, salePrice: true, quantity: true, deletedAt: true } },
        },
      });

      const isNowVariable = data.type === 'variable';

      if (foundModel.isVariable && !isNowVariable) {
        // mudou: variado -> simples

        const variantsToRemove = foundModel.variants.filter((v) => !v.deletedAt);
        await Promise.all(variantsToRemove.map(({ id }) => this.removeVariant(id, tx)));

        const { costPrice, salePrice, quantity } = data;
        await this.createVariant(modelId, { color: '', size: '', costPrice, salePrice, quantity }, tx);
      }

      if (!foundModel.isVariable && isNowVariable) {
        // mudou: simples -> variado

        const defaultVariant = foundModel.variants.find((v) => !v.deletedAt);

        if (defaultVariant) {
          await this.removeVariant(defaultVariant.id, tx);
        }

        await Promise.all(data.variants.map(({ id, status, ...v }) => this.createVariant(modelId, v, tx)));
      }

      if (!foundModel.isVariable && !isNowVariable) {
        // manteve: simples -> simples

        const { id, deletedAt, ...defaultVariant } = foundModel.variants.find((v) => !v.deletedAt) ?? {};

        if (id) {
          const newVariant = { costPrice: data.costPrice, salePrice: data.salePrice };
          const canUpdateVariant = !util.isDeepStrictEqual(defaultVariant, newVariant);

          if (canUpdateVariant) {
            await this.updateVariant(id, newVariant, tx);
          }
        }
      }

      if (foundModel.isVariable && isNowVariable) {
        // manteve: variado -> variado

        const removedVariants = data.variants.filter((v) => v.status === 'removed');
        const addedVariants = data.variants.filter((v) => v.status === 'added');
        const modifiedVariants = data.variants.filter((v) => v.status === 'modified');

        await Promise.all(removedVariants.map(({ id }) => this.removeVariant(id, tx)));
        await Promise.all(addedVariants.map(({ status, ...v }) => this.createVariant(modelId, v, tx)));
        await Promise.all(modifiedVariants.map(({ status, quantity, id, ...v }) => this.updateVariant(id, v, tx)));
      }

      const updatedModel = await tx.model.update({
        where: { id: modelId },
        data: {
          name: data.name,
          isVariable: isNowVariable,
        },
        select: ModelService.modelSelectFields,
      });

      return updatedModel;
    });

    return this.toModelDto(result);
  }

  async findVariants(modelId: string) {
    const variants = await this.prisma.modelVariant.findMany({
      where: { modelId, deletedAt: null },
      select: {
        id: true,
        color: true,
        size: true,
        quantity: true,
        costPrice: true,
        salePrice: true,
      },
    });

    return variants;
  }

  async delete(id: string) {
    const model = await this.prisma.model.delete({ where: { id } });

    return model;
  }
}

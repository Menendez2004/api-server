import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaginationInput } from '../helpers/pagination/pagination.input';
import { PaginationMeta } from '../helpers/pagination/pagination.meta';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { ValidatorService } from '../helpers/service/validator.service';
import { ProductFiltersInput } from './dto/filters/product.input.filter';
import { SortingProductInput } from './dto/products.sorting.input';
import { ProductType } from './dto/products.intefaces.dto';
import {
  paginate,
  PaginatedResult,
} from 'src/helpers/pagination/pagination.helper';
import { CreateProductInput } from './dto/products.create.input';
import { CloudinaryService } from '../helpers/cloudinary/cloudinary.service';
import { Prisma, ProductImages } from '@prisma/client';
import { ImagesTypes } from './types/images.type';
import { plainToInstance } from 'class-transformer';
import { UpdateProductInput } from './dto/products.update.input';
import { ProductsPagination } from './dto/products.pagination';
import { OperationType } from '../helpers/enums/operation.type.enum';

@Injectable()
export class ProductsService {
  /**
   * @param validatorService - Service for product data validation.
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validatorService: ValidatorService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    filters?: ProductFiltersInput,
    sortBy?: SortingProductInput,
    pagination?: PaginationInput,
  ): Promise<ProductsPagination> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    const where = {
      ...(filters?.name && {
        name: { contains: filters.name, mode: Prisma.QueryMode.insensitive },
      }),
      ...(filters?.price && { price: { equals: parseFloat(filters.price) } }),
      ...(filters?.categoryId && {
        categoryId: { equals: filters.categoryId },
      }),
      ...(filters?.isAvailable && {
        isAvailable: { equals: Boolean(filters.isAvailable) },
      }),
    };

    const orderBy = sortBy
      ? [{ [sortBy.field]: sortBy.order.toLowerCase() as 'asc' | 'desc' }]
      : [{ price: 'desc' as 'asc' | 'desc' }]; // Updated default
    console.log(sortBy);

    const [items, totalItems] = await Promise.all([
      this.prismaService.products.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.products.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const meta = {
      totalItems,
      totalPages,
      limit,
      page,
    };

    return {
      collection: items,
      meta,
    };
  }

  async findOne(id: string): Promise<ProductType> {
    return this.validatorService.findOneProductById({ id });
  }

  async createProduct(input: CreateProductInput) {
    const { categoryId, ...data } = input;
    if (!categoryId) {
      throw new UnprocessableEntityException(
        'cannot create product without category',
      );
    }
    const product = await this.prismaService.products.create({
      data: {
        ...data,
        name: data.name,
        price: data.price,
      },
    });
    await this.associateProductWithCategories(categoryId, product.id);
    return product;
  }

  async associateProductWithCategories(
    categories: number[],
    productId: string,
  ): Promise<void> {
    if (!categories?.length) return;
    await this.prismaService.productCategories.createMany({
      data: categories.map((categoryId) => ({
        categoryId: categoryId,
        productId: productId,
      })),
      skipDuplicates: true,
    });
  }

  async uploadProductImage(
    producId: string,
    file: Express.Multer.File,
  ): Promise<ProductImages> {
    await this.validatorService.findOneProductById({ id: producId });
    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    const imageCreationData: Prisma.ProductImagesCreateInput = {
      id: producId,
      imageUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      product: { connect: { id: producId } },
    };
    return this.addProductsImages(imageCreationData);
  }

  async addProductsImages(
    data: Prisma.ProductImagesCreateInput,
  ): Promise<ProductImages> {
    await this.validatorService.findProductExitence(data.product.connect?.id);
    return this.prismaService.productImages.create({ data });
  }

  async getProductImages(productId: string): Promise<ImagesTypes[]> {
    const productImages = await this.prismaService.productImages.findMany({
      where: {
        productId,
      },
    });
    return productImages.map((images) => {
      return plainToInstance(ImagesTypes, images);
    });
  }

  async updateProductImageCategories(
    data: UpdateProductInput,
  ): Promise<ProductImages> {
    await this.validatorService.findProductExitence(data.id);
    const dataCategory = data.categories.map((categoryId) => ({
      categoryId,
      productId: data.id,
    }));
    if (data.operation === OperationType.ADD) {
      await this.prismaService.productCategories.createMany({
        data: dataCategory,
        skipDuplicates: true,
      });
    } else if (data.operation === OperationType.REMOVE) {
      await this.prismaService.productCategories.deleteMany({
        where: {
          productId: data.id,
          categoryId: {
            in: data.categories,
          },
        },
      });
    }
    return this.updateProductImageCategories(data);
  }

  async removeProduct(id: string): Promise<void> {
    await this.validatorService.findProductExitence(id);
    const productImageRecords = await this.prismaService.productImages.findMany(
      {
        where: {
          productId: id,
        },
        select: {
          publicId: true,
        },
      },
    );
    if (productImageRecords.length >= 1) {
      productImageRecords.forEach(async (publicId) => {
        await this.prismaService.productImages.delete({
          where: { publicId: publicId.publicId },
        });
      });
    }
  }

  async removeProductImages(publicId: string): Promise<{ result: string }> {
    const response = await this.cloudinaryService.destroyFile(publicId);
    if (response.result !== 'ok')
      throw new InternalServerErrorException(
        `It wasn't possible to delete the image: ${response.result}`,
      );
    await this.prismaService.productImages.delete({
      where: { publicId },
    });
    return { result: response.result };
  }

  async getProductPrice(productId: string): Promise<number> {
    const product = await this.prismaService.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        price: true,
      },
    });
    if (!product) {
      throw new NotFoundException('look like the product does not exist');
    }
    return product.price;
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaginationInput } from '../helpers/pagination/pagination.input';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UpdateProductRes, CreateProductsRes } from './dto/res/index.res';
import { ValidatorService } from '../helpers/service/validator.service';
import { ProductFiltersInput } from './dto/filters/product.input.filter';
import { SortingProductInput } from './dto/products.sorting.input';
import { UpdateProductArg } from './dto/args/update.product.args';
import { CreateProductInput } from './dto/products.create.input';
import { CloudinaryService } from '../helpers/cloudinary/cloudinary.service';
import { Prisma, ProductImages } from '@prisma/client';
import { ImagesTypes } from './types/images.type';
import { plainToInstance } from 'class-transformer';
import { UpdateProductInput } from './dto/products.update.input';
import { ProductsPagination } from './dto/products.pagination';
import { OperationType } from '../helpers/enums/operation.type.enum';
import { UpdateProductImagesArgs } from './dto/args/update.product.image.args';
import { UploadApiErrorResponse } from 'cloudinary';

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
      ? [{ [sortBy.field]: sortBy.order as 'asc' | 'desc' }]
      : [{ price: 'desc' as 'asc' | 'desc' }];

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

  async createProduct(input: CreateProductInput): Promise<CreateProductsRes> {
    const { categoryId, ...data } = input;
    if (!categoryId) {
      throw new UnprocessableEntityException();
    }
    const product = await this.prismaService.products.create({
      data: {
        ...data,
        name: data.name,
        price: data.price,
      },
    });
    await this.associateProductWithCategories(categoryId, product.id);
    return plainToInstance(CreateProductsRes, product);
  }

  async updateProductData(
    id: string,
    data: UpdateProductArg,
  ): Promise<UpdateProductRes> {
    await this.validatorService.ensureProductExists(id);

    if (data.stock <= 0) data.isAvailable = false;
    const update = this.removeNullProperties({
      name: data.name,
      description: data.description,
      stock: data.stock,
      isAvailable: data.isAvailable,
      price: data.price,
    });
    const product = await this.prismaService.products.update({
      where: { id },
      data: update,
    });
    return plainToInstance(UpdateProductRes, product);
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
    image: Express.Multer.File,
  ): Promise<ProductImages> {
    await this.validatorService.findProductExitence(producId);
    const uploadedFile = (await this.cloudinaryService.uploadFile(
      image,
    )) as UploadApiErrorResponse;

    return this.prismaService.productImages.create({
      data: {
        imageUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        product: {
          connect: { id: producId },
        },
      },
    });
  }

  async updateProductImage(
    productId: string,
    uploadImages: Express.Multer.File[],
    updateImage: UpdateProductImagesArgs,
  ): Promise<void> {
    this.checkImageUpdateParams(updateImage, uploadImages);
    await this.validatorService.findProductExitence(productId);
    if (updateImage.operation === 'ADD') {
      for (const uploadImage of uploadImages) {
        await this.uploadProductImage(productId, uploadImage);
      }
    } else if (updateImage.operation === 'REMOVE') {
      for (const publicId of updateImage.publicImageId) {
        await this.removeProductImages(publicId);
      }
    }
  }

  async addProductsImages(
    data: Prisma.ProductImagesCreateInput,
  ): Promise<ProductImages> {
    await this.validatorService.findProductExitence(data.product.connect.id);
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
      for (const publicId of productImageRecords) {
        await this.prismaService.productImages.delete({
          where: { publicId: publicId.publicId },
        });
      }
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

  private removeNullProperties<T extends Record<string, any>>(
    obj: T,
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([value]) => value != null),
    ) as Partial<T>;
  }

  private checkImageUpdateParams(
    { operation, path, publicImageId }: UpdateProductImagesArgs,
    uploadedImages: Express.Multer.File[],
  ) {
    const SUPPORTED_PATH = '/images';
    const SUPPORTED_OPERATIONS = ['ADD', 'REMOVE'];
    const ERRORS = {
      INVALID_PATH: `Invalid path. Only "${SUPPORTED_PATH}" is supported.`,
      INVALID_OPERATION: `Invalid operation. Supported operations are: ${SUPPORTED_OPERATIONS.join(', ')}.`,
      ADD_OPERATION_REQUIRES_IMAGES:
        'The "add" operation requires at least one uploaded image file.',
      REMOVE_OPERATION_REQUIRES_ID:
        'The "remove" operation requires at least one public image identifier.',
    };

    if (path !== SUPPORTED_PATH) {
      throw new BadRequestException(ERRORS.INVALID_PATH);
    }

    if (!SUPPORTED_OPERATIONS.includes(operation)) {
      throw new BadRequestException(ERRORS.INVALID_OPERATION);
    }

    if (
      operation === 'ADD' &&
      (!uploadedImages || uploadedImages.length === 0)
    ) {
      throw new BadRequestException(ERRORS.ADD_OPERATION_REQUIRES_IMAGES);
    }

    if (
      operation === 'REMOVE' &&
      (!publicImageId || publicImageId.length === 0)
    ) {
      throw new BadRequestException(ERRORS.REMOVE_OPERATION_REQUIRES_ID);
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UpdateProductRes } from './dto/res/index.res';
import { MocksProductService } from '../../test/mocks/product.mocks';
import { UploadApiResponse } from 'cloudinary';
import {
  PaginationMeta,
  ProductFiltersInput,
  ProductSortableField,
  SortingProductInput,
} from './dto/index.dto';
import { SortOrder } from '../helpers/enums/sort.order.enum';
import { Prisma } from '@prisma/client';
import { ValidatorService } from '../helpers/service/validator.service';
import { CloudinaryService } from '../helpers/cloudinary/cloudinary.service';
import {
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('ProductsService', () => {
  let productService: ProductsService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;
  let validatorService: ValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidatorService,
        ProductsService,
        CloudinaryService,
        {
          provide: PrismaService,
          useValue: {
            products: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            productImages: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            productCategories: {
              findMany: jest.fn(),
              createMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    productService = module.get(ProductsService);
    prismaService = module.get(PrismaService);
    validatorService = module.get(ValidatorService);
    cloudinaryService = module.get(CloudinaryService);
  });

  describe('findAll', () => {
    it('should return paginated products with default pagination', async () => {
      const mockProducts = MocksProductService.paginationProductMock;
      const mockTotalItems = mockProducts.length;

      jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(mockProducts);
      jest
        .spyOn(prismaService.products, 'count')
        .mockResolvedValue(mockTotalItems);

      const result = await productService.findAll();

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ price: 'desc' }],
        skip: 0,
        take: 20,
      });

      expect(prismaService.products.count).toHaveBeenCalledWith({
        where: {},
      });

      const expectedMeta: PaginationMeta = {
        totalItems: mockTotalItems,
        totalPages: 1,
        limit: 20,
        page: 1,
      };

      expect(result.collection).toEqual(mockProducts);
      expect(result.meta).toEqual(expectedMeta);
    });

    it('should apply filters and sorting', async () => {
      const mockProducts = [MocksProductService.defaultProductMock];
      const mockTotalItems = 1;

      jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(mockProducts);
      jest
        .spyOn(prismaService.products, 'count')
        .mockResolvedValue(mockTotalItems);

      const filters: ProductFiltersInput = {
        name: 'product',
        isAvailable: true,
      };
      const sortBy: SortingProductInput = {
        field: ProductSortableField.PRICE,
        order: SortOrder.DESC,
      };

      const result = await productService.findAll(
        { ...filters },
        { ...sortBy },
      );

      expect(prismaService.products.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: filters.name, mode: Prisma.QueryMode.insensitive },
          isAvailable: { equals: true },
        },
        orderBy: [{ price: 'desc' }],
        skip: 0,
        take: 20,
      });

      expect(prismaService.products.count).toHaveBeenCalledWith({
        where: {
          name: { contains: filters.name, mode: Prisma.QueryMode.insensitive },
          isAvailable: { equals: true },
        },
      });

      const expectedMeta: PaginationMeta = {
        totalItems: mockTotalItems,
        totalPages: 1,
        limit: 20,
        page: 1,
      };

      expect(result.collection).toEqual(mockProducts);
      expect(result.meta).toEqual(expectedMeta);
    });
  });

  describe('createProduct', () => {
    it('should throw an error if categoryId is missing', async () => {
      const args = {
        name: 'Test Product',
        description: 'Test Description',
        stock: 10,
        isAvailable: true,
        price: 100,
        categoryId: undefined,
      };

      await expect(productService.createProduct(args)).rejects.toThrow(
        new UnprocessableEntityException(),
      );
    });

    it('should create a product successfully and return AddProductRes', async () => {
      (prismaService.products.create as jest.Mock).mockResolvedValue({
        id: '9026cddf-ed72-4241-89da-c2c90f23fcd6',
        createdAt: new Date(),
      });
      const args = {
        name: 'Test Product',
        description: 'Test Description',
        stock: 10,
        isAvailable: true,
        price: 100,
        categoryId: [1, 2],
      };

      const result = await productService.createProduct(args);
      expect(result.id).toBe('9026cddf-ed72-4241-89da-c2c90f23fcd6');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(prismaService.products.create).toHaveBeenCalled();
    });
  });

  describe('editProduct', () => {
    it('should update data of a product successfully', async () => {
      (prismaService.products.findUnique as jest.Mock).mockResolvedValue({
        id: '9026cddf-ed72-4241-89da-c2c90f23fcd6',
      });

      const mockUpdate = new Date();
      const args = {
        name: 'Test Product',
        stock: 2999,
      };
      (prismaService.products.update as jest.Mock).mockResolvedValue({
        id: '9026cddf-ed72-4241-89da-c2c90f23fcd6',
        updatedAt: mockUpdate,
        ...args,
      });

      const result = await productService.updateProductData(
        '9026cddf-ed72-4241-89da-c2c90f23fcd6',
        args,
      );

      expect(result).toBeInstanceOf(UpdateProductRes);
      expect(result).toEqual(expect.objectContaining(args));
      expect(prismaService.products.update).toHaveBeenCalled();
    });
  });

  describe('getProductImages', () => {
    it('should return array of product images', async () => {
      const mockImages = [
        { id: '1', imageUrl: 'url1', publicId: 'pid1', productId: 'prod1' },
        { id: '2', imageUrl: 'url2', publicId: 'pid2', productId: 'prod1' },
      ];

      (prismaService.productImages.findMany as jest.Mock).mockResolvedValue(
        mockImages,
      );

      const result = await productService.getProductImages('prod1');

      expect(prismaService.productImages.findMany).toHaveBeenCalledWith({
        where: { productId: 'prod1' },
      });
      expect(result).toEqual(mockImages);
    });
  });

  describe('uploadProductImage', () => {
    it('should upload image and create product image record', async () => {
      const productId = 'test-product';
      const mockFile = {
        filename: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockProduct = {
        id: productId,
        name: 'test-product',
        description: 'test-description',
        price: 99.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.products.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const mockCloudinaryResponse: UploadApiResponse = {
        secure_url: 'https://test-url.com',
        public_id: 'test_public_id',
        asset_id: 'test-asset',
        version_id: '1',
        version: 1,
        signature: 'test',
        width: 100,
        height: 100,
        format: 'jpg',
        resource_type: 'image',
        created_at: new Date().toISOString(),
        tags: [],
        bytes: 100,
        type: 'upload',
        etag: 'test',
        url: 'http://test-url.com',
        api_key: 'test',
        pages: 0,
        placeholder: false,
        access_mode: '',
        original_filename: '',
        moderation: [],
        access_control: [],
        context: undefined,
        metadata: undefined,
      };

      jest
        .spyOn(cloudinaryService, 'uploadFile')
        .mockResolvedValue(mockCloudinaryResponse);

      const mockImageRecord = {
        id: 'test-id',
        imageUrl: mockCloudinaryResponse.secure_url,
        publicId: mockCloudinaryResponse.public_id,
        productId: productId,
      };

      (prismaService.productImages.create as jest.Mock).mockResolvedValue(
        mockImageRecord,
      );

      const result = await productService.uploadProductImage(
        productId,
        mockFile,
      );

      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prismaService.productImages.create).toHaveBeenCalledWith({
        data: {
          imageUrl: mockCloudinaryResponse.secure_url,
          publicId: mockCloudinaryResponse.public_id,
          product: {
            connect: { id: productId },
          },
        },
      });
      expect(result).toEqual(mockImageRecord);
    });
  });

  describe('removeProduct', () => {
    it('should remove product and associated images', async () => {
      const productId = 'test-product-id';
      const mockImages = [{ publicId: 'pid1' }, { publicId: 'pid2' }];

      jest
        .spyOn(validatorService, 'findProductExitence')
        .mockResolvedValue(undefined);
      (prismaService.productImages.findMany as jest.Mock).mockResolvedValue(
        mockImages,
      );
      (prismaService.productImages.delete as jest.Mock).mockResolvedValue({});

      await productService.removeProduct(productId);

      expect(validatorService.findProductExitence).toHaveBeenCalledWith(
        productId,
      );
      expect(prismaService.productImages.findMany).toHaveBeenCalledWith({
        where: { productId },
        select: { publicId: true },
      });
      expect(prismaService.productImages.delete).toHaveBeenCalledTimes(
        mockImages.length,
      );
    });

    it('should handle product removal with no images', async () => {
      const productId = 'test-product-id';

      jest
        .spyOn(validatorService, 'findProductExitence')
        .mockResolvedValue(undefined);
      (prismaService.productImages.findMany as jest.Mock).mockResolvedValue([]);

      await productService.removeProduct(productId);

      expect(validatorService.findProductExitence).toHaveBeenCalledWith(
        productId,
      );
      expect(prismaService.productImages.delete).not.toHaveBeenCalled();
    });
  });

  describe('getProductPrice', () => {
    it('should return product price when product exists', async () => {
      const productId = 'test-product-id';
      const mockProduct = { price: 99.99 };

      (prismaService.products.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await productService.getProductPrice(productId);

      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        select: { price: true },
      });
      expect(result).toBe(99.99);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const productId = 'non-existent-id';

      (prismaService.products.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(productService.getProductPrice(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeProductImages', () => {
    it('should successfully remove image', async () => {
      const publicId = 'test-public-id';
      const mockCloudinaryResponse = {
        result: 'ok',
        message: 'success',
        name: 'testing',
        http_code: 200,
      };

      jest
        .spyOn(cloudinaryService, 'destroyFile')
        .mockResolvedValue(mockCloudinaryResponse);
      (prismaService.productImages.delete as jest.Mock).mockResolvedValue({});

      const result = await productService.removeProductImages(publicId);

      expect(cloudinaryService.destroyFile).toHaveBeenCalledWith(publicId);
      expect(prismaService.productImages.delete).toHaveBeenCalledWith({
        where: { publicId },
      });
      expect(result).toEqual({ result: 'ok' });
    });
    it('should throw InternalServerErrorException when cloudinary deletion fails', async () => {
      const publicId = 'test-public-id';
      const mockCloudinaryResponse = {
        message: 'error',
        name: 'test',
        http_code: 500,
      };

      jest
        .spyOn(cloudinaryService, 'destroyFile')
        .mockResolvedValue(mockCloudinaryResponse);

      await expect(
        productService.removeProductImages(publicId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(prismaService.productImages.delete).not.toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { OperationType } from '../helpers/enums/operation.type.enum';
import { CreateProductsRes, DeletedProductsRes } from './dto/res/index.res';
import { UpdateProductImagesArgs } from './dto/args/update.product.imageArg';
import { MocksProductService } from '../../test/mocks/product.mocks';
import { PaginationMeta, ProductFiltersInput, ProductSortableField, SortingProductInput } from './dto/index.dto';
import { SortOrder } from '../helpers/enums/sort.order.enum';
import { Prisma } from '@prisma/client';
import { ValidatorService } from '../helpers/service/validator.service';
import { CloudinaryService } from '../helpers/cloudinary/cloudinary.service';
import { UnprocessableEntityException } from '@nestjs/common';





describe('ProductsService', () => {
  let productService: ProductsService;
  let prismaService: PrismaService;
  let validatorService: ValidatorService;
  let cloudinaryService: CloudinaryService;

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
          }
        }
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

      jest.spyOn(prismaService.products, 'findMany').mockResolvedValue(mockProducts);
      jest.spyOn(prismaService.products, 'count').mockResolvedValue(mockTotalItems);

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

      jest.spyOn(prismaService.products, 'findMany').mockResolvedValue(mockProducts);
      jest.spyOn(prismaService.products, 'count').mockResolvedValue(mockTotalItems);

      const filters: ProductFiltersInput = { name: 'product', isAvailable: true };
      const sortBy: SortingProductInput = { field: ProductSortableField.PRICE, order: SortOrder.DESC };

      const result = await productService.findAll({ ...filters }, { ...sortBy });

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
      expect(prismaService.products.create).toHaveBeenCalled()
    });
  });

  describe('editProduct', () => {})
});


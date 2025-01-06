import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { OperationType } from '../helpers/enums/operation.type.enum';
import { CreateProductsRes,DeletedProductsRes } from './dto/res/index.res';
import { UpdateProductImagesArgs } from './dto/args/update.product.imageArg';



describe('ProductsService', () => {
  let service: ProductsService;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,{
          provide: PrismaService,
          useValue:{
            products:{
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
              upsert: jest.fn(),
            },
            productImages:{
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
              upsert: jest.fn(),
            },
            productCategories:{
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
              upsert: jest.fn(),
            },
          }
        }
        
      ],
    }).compile();

    service = module.get(ProductsService);
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should', () => {

    });
  });

  describe('findOne', () => {
    it('should', () => {

    });
  });

  describe('createProduct', () => {
    it('should', () => {

    });
  });

  describe('associateProductWithCategories', () => {
    it('should', () => {

    });
  });

  describe('uploadProductImage', () => {
    it('should', () => {

    });
  });

  describe('addProductsImages', () => {
    it('should', () => {

    });
  });

  describe('getProductImages', () => {
    it('should', () => {

    });
  });

  describe('updateProductImageCategories', () => {
    it('should', () => {

    });
  });

  describe('removeProduct', () => {
    it('should', () => {

    });
  });

  describe('removeProductImages', () => {
    it('should', () => {

    });
  });

  describe('getProductPrice', () => {
    it('should', () => {

    });
  });
});
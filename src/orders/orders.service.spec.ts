import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from './orders.service';

class PrismaServiceMock {
  onModuleInit = jest.fn();
  onModuleDestroy = jest.fn();
  enableShutdownHooks = jest.fn();
}

class CartsServiceMock {
  addProductToCart = jest.fn();
  deleteProductFromCart = jest.fn();
  findCartById = jest.fn();
  validateCartOwnership = jest.fn();
  clearCartItems = jest.fn();
  getCartItems = jest.fn();
  getCartByUserId = jest.fn();
  getCartItemsByCartId = jest.fn();
}

class UsersServiceMock {
  createUser = jest.fn();
  hashPass = jest.fn();
  findById = jest.fn();
  findByEmail = jest.fn();
  getUserRole = jest.fn();
  resetPass = jest.fn();
}

class ProductsServiceMock {
  findAll = jest.fn();
  findOne = jest.fn();
  createProduct = jest.fn();
  associateProductWithCategories = jest.fn();
  uploadProductImage = jest.fn();
  addProductsImages = jest.fn();
  getProductImages = jest.fn();
  updateProductImageCategories = jest.fn();
  removeProduct = jest.fn();
  removeProductImages = jest.fn();
  getProductPrice = jest.fn();
}

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaServiceMock;
  let cartsService: CartsServiceMock;
  let usersService: UsersServiceMock;
  let productsService: ProductsServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersService],
      providers: [
        {
          provide: PrismaService,
          useClass: PrismaServiceMock,
        },
        {
          provide: CartsService,
          useClass: CartsServiceMock,
        },
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
        {
          provide: ProductsService,
          useClass: ProductsServiceMock,
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    prismaService = module.get(PrismaService);
    cartsService = module.get(CartsService);
    usersService = module.get(UsersService);
    productsService = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrder', () => {
    it('should', () => {

    });
  });

  describe('getOrderById', () => {
    it('should', () => {

    });
  });
});
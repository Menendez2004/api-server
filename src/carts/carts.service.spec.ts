import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CartServiceMocks } from '../../test/mocks/carts.mock';
import { RemoveProductFromCartArgs } from './dto/args/remove.product.from.cart.args';
import { MocksProductService } from '../../test/mocks/product.mocks';
import { RemoveProductCartRes } from './dto/res/index.res';
import { plainToInstance } from 'class-transformer';
import { ValidatorService } from '../helpers/service/validator.service';

describe('CartsService', () => {
  let cartService: CartsService;
  let prismaService: PrismaService;
  let productService: ProductsService;
  let validatorService: ValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: PrismaService,
          useValue: {
            carts: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            cartItems: {
              upsert: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            products: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ValidatorService,
          useValue: {
            ensureProductExists: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findProductById: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    cartService = module.get<CartsService>(CartsService);
    prismaService = module.get<PrismaService>(PrismaService);
    validatorService = module.get<ValidatorService>(ValidatorService);
    productService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addProductToUserCart', () => {
    it('Should ensure a product is added to the cart when enough stock is available.', async () => {
      const userId = '3f9b554a-eb21-481d-8dc4-8d372c3b2454';
      const mockArgs = {
        productId: 'c107df05-8d45-4e7b-89ea-c81c6e8cedba',
        quantity: 2,
        cartId: 'bb42fe24-f701-438e-923a-a7cae23f2ff8',
      };

      // Mock product existence with enough stock
      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue({
        id: mockArgs.productId,
        name: 'Sample Product',
        stock: 10,
        isAvailable: true,
        price: 100,
      });

      // Mock fetchOrCreateCart
      jest
        .spyOn(cartService, 'fetchOrCreateCart')
        .mockResolvedValue(CartServiceMocks.cart);

      // Mock upsertCartItem
      jest
        .spyOn(cartService, 'upsertCartItem')
        .mockResolvedValue(CartServiceMocks.cartItem);

      // Execute service method
      const result = await cartService.addProductToUserCart(userId, mockArgs);

      // Assertions
      expect(validatorService.ensureProductExists).toHaveBeenCalledWith(
        mockArgs.productId,
      );
      expect(cartService.fetchOrCreateCart).toHaveBeenCalledWith(
        userId,
        mockArgs.cartId,
      );
      expect(cartService.upsertCartItem).toHaveBeenCalledWith(
        mockArgs.cartId,
        mockArgs.productId,
        mockArgs.quantity,
      );

      expect(result).toEqual(
        expect.objectContaining(CartServiceMocks.updatedCartItem),
      );
    });
    it('should throw NotFoundException if product stock is insufficient', async () => {
      const userId = 'user001';
      const mockArgs = { productId: 'pro001', quantity: 888 };

      productService.findAll = jest
        .fn()
        .mockResolvedValue(MocksProductService.productWithMinimalStock);

      jest
        .spyOn(cartService, 'fetchOrCreateCart')
        .mockResolvedValue(CartServiceMocks.cart);

      await expect(
        cartService.addProductToUserCart(userId, mockArgs),
      ).rejects.toThrow(NotAcceptableException);

      expect(productService.findAll).toHaveBeenCalledWith(mockArgs.productId);
      expect(cartService.fetchOrCreateCart).not.toHaveBeenCalled();
    });

    it('should create a new cart if none exists for the user', async () => {
      const mockArgs = { productId: 'pro001', quantity: 1 };

      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue(
        MocksProductService.defaultProductMock,
      );

      jest
        .spyOn(cartService, 'fetchOrCreateCart')
        .mockResolvedValue(CartServiceMocks.cart);
      jest
        .spyOn(cartService, 'upsertCartItem')
        .mockResolvedValue(CartServiceMocks.cartItem);

      const result = await cartService.addProductToUserCart(
        'user123',
        mockArgs,
      );
      expect(cartService.fetchOrCreateCart).toHaveBeenCalledWith(
        'user123',
        undefined,
      );

      expect(result).toEqual(
        expect.objectContaining(CartServiceMocks.updatedCartItem),
      );
    });
  });

  describe('deleteProductFromCart', () => {
    const mockUserId = 'user123';
    const mockArgs: RemoveProductFromCartArgs = {
      productId: 'ff7aade2-3920-48ce-b419-8385b324f25c',
      cartId: '49c84175-021f-4603-a1b4-836f1f287dea',
    };

    it('should delete a product from the cart', async () => {
      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue(
        MocksProductService.productToRemoveFromCart,
      );
      jest
        .spyOn(cartService, 'findCartById')
        .mockResolvedValue(CartServiceMocks.cartFromDeleteProductFromCart);

      jest.spyOn(cartService, 'validateCartOwnership').mockImplementation();

      jest
        .spyOn(prismaService.cartItems, 'delete')
        .mockResolvedValue(CartServiceMocks.cartItemToDelete);

      const result = plainToInstance(RemoveProductCartRes, {
        deletedAt: new Date(),
      });
      expect(result).toBeInstanceOf(RemoveProductCartRes);
      expect(result.deletedAt).toBeDefined();
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result).toEqual(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if the product is not found in the cart', async () => {
      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue(
        MocksProductService.productToRemoveFromCart,
      );

      jest.spyOn(cartService, 'findCartById').mockResolvedValue({
        id: 'cart123',
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(cartService, 'validateCartOwnership').mockImplementation();

      jest
        .spyOn(prismaService.cartItems, 'delete')
        .mockRejectedValue(new Error('Record not found'));

      await expect(
        cartService.removeProductFromCart(mockUserId, mockArgs),
      ).rejects.toThrow(NotFoundException);

      expect(validatorService.ensureProductExists).toHaveBeenCalledWith(
        mockArgs.productId,
      );
      expect(cartService.findCartById).toHaveBeenCalledWith(mockArgs.cartId);
      expect(cartService.validateCartOwnership).toHaveBeenCalledWith(
        {
          id: 'cart123',
          userId: mockUserId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        mockUserId,
      );
      expect(prismaService.cartItems.delete).toHaveBeenCalledWith({
        where: {
          cartId_productId: {
            cartId: mockArgs.cartId,
            productId: mockArgs.productId,
          },
        },
      });
    });

    it('should throw UnauthorizedAccessException if the cart belongs to a different user', async () => {
      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue(
        MocksProductService.productToRemoveFromCart,
      );

      jest
        .spyOn(cartService, 'findCartById')
        .mockResolvedValue(CartServiceMocks.notAcceptableExceptionCart);

      await expect(
        cartService.removeProductFromCart(mockUserId, mockArgs),
      ).rejects.toThrow(NotAcceptableException);

      expect(validatorService.ensureProductExists).toHaveBeenCalledWith(
        mockArgs.productId,
      );
      expect(cartService.findCartById).toHaveBeenCalledWith(mockArgs.cartId);
    });
  });

  describe('getCartByUserId', () => {
    const userId = 'user123';

    it('should return the cart for the user', async () => {
      const mockCart = CartServiceMocks.cartToGetCartByUserId(userId);

      jest.spyOn(prismaService.carts, 'findUnique').mockResolvedValue(mockCart);

      const result = await cartService.getCartByUserId(userId);

      expect(prismaService.carts.findUnique).toHaveBeenCalledWith({
        where: { userId: userId },
        include: cartService['getCartIncludeRelations'](),
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: mockCart.id,
          cart_items: expect.arrayContaining(
            mockCart.cartItems?.map((item) =>
              expect.objectContaining({
                id: item.id,
                product: expect.objectContaining({
                  id: item.product.id,
                  name: item.product.name,
                }),
              }),
            ),
          ),
        }),
      );
    });
    it('should throw NotFoundException if the cart is not found', async () => {
      jest.spyOn(prismaService.carts, 'findUnique').mockResolvedValue(null);

      await expect(cartService.getCartByUserId(userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.carts.findUnique).toHaveBeenCalledWith({
        where: { userId: userId },
        include: cartService['getCartIncludeRelations'](),
      });
    });
  });

  describe('getCartItemsByCartId', () => {
    const cartId = '49c84175-021f-4603-a1b4-836f1f287dea';

    it('should return the cart items for the cart', async () => {
      const mockCart = CartServiceMocks.cart;
      const mockCartItems = CartServiceMocks.cartItemToGetCartById;

      jest.spyOn(cartService, 'findCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(prismaService.cartItems, 'findMany')
        .mockResolvedValue(mockCartItems);

      const result = await cartService.getCartItemsByCartId(cartId);

      expect(cartService.findCartById).toHaveBeenCalledWith(cartId);
      expect(prismaService.cartItems.findMany).toHaveBeenCalledWith({
        where: { cartId: cartId },
        include: cartService['getCartItemIncludeRelations'](),
      });

      expect(result).toEqual(
        expect.arrayContaining(
          mockCartItems.map((item) =>
            expect.objectContaining({
              id: item.id,
              quantity: item.quantity,
              product: expect.objectContaining({
                id: item.product.id,
                name: item.product.name,
              }),
            }),
          ),
        ),
      );
    });

    it('should throw NotFoundException if the cart does not exist', async () => {
      jest
        .spyOn(cartService, 'findCartById')
        .mockRejectedValue(new NotFoundException());

      await expect(cartService.getCartItemsByCartId(cartId)).rejects.toThrow(
        NotFoundException,
      );

      expect(cartService.findCartById).toHaveBeenCalledWith(cartId);
      expect(prismaService.cartItems.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getOrCreateCart', () => {
    const userId = CartServiceMocks.cart.userId;
    const mockCart = CartServiceMocks.cart;
    it('should return an existing cart if it exists', async () => {
      jest.spyOn(prismaService.carts, 'findUnique').mockResolvedValue(mockCart);

      const result = await cartService.fetchOrCreateCart(userId);

      expect(prismaService.carts.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result).toEqual(mockCart);
    });

    it('should return a new cart when none exists', async () => {
      jest.spyOn(prismaService.carts, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.carts, 'create')
        .mockResolvedValue(CartServiceMocks.cart);

      const result = await cartService.fetchOrCreateCart(userId);

      expect(prismaService.carts.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(prismaService.carts.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: userId } },
        },
      });

      expect(result).toEqual(CartServiceMocks.cart);
    });

    it('should throw NotAcceptableException if the cart does not belong to the user', async () => {
      const userId = 'notUserOwnerId';

      jest.spyOn(prismaService.carts, 'findUnique').mockResolvedValue(mockCart);

      jest
        .spyOn(cartService, 'validateCartOwnership')
        .mockImplementation(() => {
          throw new NotAcceptableException();
        });

      await expect(
        cartService.fetchOrCreateCart(userId, mockCart.id),
      ).rejects.toThrow(NotAcceptableException);

      expect(cartService.validateCartOwnership).toHaveBeenCalledWith(
        mockCart,
        userId,
      );
    });
  });
  describe('upsertCartItem', () => {
    it('should  a new cart item when it does not exist', async () => {
      const cartId = 'cart456';
      const productId = 'product456';
      const quantity = 3;

      const newCartItem = CartServiceMocks.newUpsertCartItem(
        cartId,
        productId,
        quantity,
      );

      jest
        .spyOn(prismaService.cartItems, 'upsert')
        .mockResolvedValue(newCartItem);

      const result = await cartService.upsertCartItem(
        cartId,
        productId,
        quantity,
      );

      expect(prismaService.cartItems.upsert).toHaveBeenCalledWith({
        where: {
          cartId_productId: { cartId, productId },
        },
        update: { quantity },
        create: {
          cartId,
          productId,
          quantity,
        },
      });

      expect(result).toEqual(newCartItem);
    });
    it('should update the quantity of an existing cart item', async () => {
      const cartId = CartServiceMocks.cart.id;
      const productId = CartServiceMocks.cartItem.productId;
      const quantity = 3;
      const updatedCartItem = CartServiceMocks.newUpsertCartItem(
        cartId,
        productId,
        quantity,
      );

      jest
        .spyOn(prismaService.cartItems, 'upsert')
        .mockResolvedValue(updatedCartItem);

      const result = await cartService.upsertCartItem(
        cartId,
        productId,
        quantity,
      );

      expect(prismaService.cartItems.upsert).toHaveBeenCalledWith({
        where: {
          cartId_productId: { cartId, productId },
        },
        update: { quantity },
        create: {
          cartId,
          productId,
          quantity,
        },
      });

      expect(result).toEqual(updatedCartItem);
    });
  });
  describe('clearCartItems', () => {
    it('should delete all cart items for the given cart ID', async () => {
      const cartId = 'testCart123';
      const mockDeleteResult = { count: 3 };

      jest
        .spyOn(prismaService.cartItems, 'deleteMany')
        .mockResolvedValue(mockDeleteResult);

      const result = await cartService.clearCartItems(cartId);

      expect(prismaService.cartItems.deleteMany).toHaveBeenCalledWith({
        where: { cartId },
      });
      expect(result).toEqual(mockDeleteResult);
    });
  });
});

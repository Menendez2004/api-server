import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { RoleName } from '@prisma/client';
import { NewOrderArg } from './dto/args/index.args';
import { OrderType } from './types/order.types';
import { NewOrderRecordRes } from './dto/res/index.res';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let cartsService: CartsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            orders: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            orderDetails: { createMany: jest.fn() },
          },
        },
        {
          provide: CartsService,
          useValue: {
            findCartById: jest.fn(),
            getCartItems: jest.fn(),
            clearCartItems: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            getProductPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cartsService = module.get<CartsService>(CartsService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('addOrder', () => {
    it('should successfully create an order and return the expected response object', async () => {
      jest.spyOn(cartsService, 'findCartById').mockResolvedValue({
        userId: 'user123',
      } as any);

      jest
        .spyOn(cartsService, 'getCartItems')
        .mockResolvedValue([{ productId: 'prod123', quantity: 2 }] as any);

      jest.spyOn(usersService, 'findById').mockResolvedValue({
        id: 'user123',
        address: 'test address',
      } as any);

      jest.spyOn(prismaService.orders, 'create').mockResolvedValue({
        id: 'order123',
        createdAt: new Date(),
      } as any);

      jest
        .spyOn(prismaService.orderDetails, 'createMany')
        .mockResolvedValue(null);

      const args: NewOrderArg = {
        cartId: 'cart123',
        address: 'test address',
      };
      const result = await service.addOrder('user123', args);

      expect(result).toBeInstanceOf(NewOrderRecordRes);
      expect(result.id).toBe('order123');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(prismaService.orders.create).toHaveBeenCalled();
      expect(prismaService.orderDetails.createMany).toHaveBeenCalled();
      expect(cartsService.clearCartItems).toHaveBeenCalledWith('cart123');
    });

    it('should throw NotAcceptableException if the cart does not belong to the user', async () => {
      (cartsService.findCartById as jest.Mock).mockResolvedValue({
        user_id: 'differentUser',
      });

      const args: NewOrderArg = {
        cartId: 'cart123',
        address: 'address123',
      };

      await expect(service.addOrder('user123', args)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should throw NotAcceptableException if the cart has no items', async () => {
      (cartsService.findCartById as jest.Mock).mockResolvedValue({
        user_id: 'user123',
      });
      (cartsService.getCartItems as jest.Mock).mockResolvedValue([]);

      const args: NewOrderArg = {
        cartId: 'cart123',
        address: 'address123',
      };

      await expect(service.addOrder('user123', args)).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });

  describe('getOrderById', () => {
    it('should return an order as OrderType for valid user access', async () => {
      (prismaService.orders.findUnique as jest.Mock).mockResolvedValue({
        id: 'order123',
        userId: 'user123',
        address: 'test address',
        created_at: new Date(),
        updated_at: new Date(),
        orderDetails: [],
        paymentDetail: null,
      });

      const result = await service.getOrderById('order123', {
        id: 'user123',
        role: RoleName.CLIENT,
      });

      expect(result).toBeInstanceOf(OrderType);
      expect(result.id).toBe('order123');
      expect(result.userId).toBe('user123');
    });

    it('should throw NotAcceptableException if a client tries to access another user’s order', async () => {
      (prismaService.orders.findUnique as jest.Mock).mockResolvedValue({
        id: 'order123',
        userId: 'differentUser',
      });

      await expect(
        service.getOrderById('order123', {
          id: 'user123',
          role: RoleName.CLIENT,
        }),
      ).rejects.toThrow(NotAcceptableException);
    });

    it('should throw NotFoundException if the order is not found', async () => {
      (prismaService.orders.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getOrderById('nonexistentOrderId', {
          id: 'user123',
          role: RoleName.CLIENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

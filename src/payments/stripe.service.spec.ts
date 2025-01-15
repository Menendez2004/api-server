import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { ConfigurationService } from '../helpers/configuration/configuration.service';
import { NotAcceptableException } from '@nestjs/common';
import { RoleName } from '@prisma/client';

describe('StripeService', () => {
  let stripeService: StripeService;
  let prismaService: PrismaService;
  let orderService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: PrismaService,
          useValue: {
            paymentDetails: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: OrdersService,
          useValue: {
            getOrderById: jest.fn(),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            stripeSecretKey: 'test-secret-key',
            stripeWebhookSigningSecret: 'test-signing-secret',
          },
        },
      ],
    }).compile();

    stripeService = module.get<StripeService>(StripeService);
    prismaService = module.get<PrismaService>(PrismaService);
    orderService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent and save payment details', async () => {
      const orderId = 'order123';
      const user = { id: 'user123', role: RoleName.CLIENT };
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        address: '123 Test Street',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderDetails: [
          {
            id: 'detail123',
            orderId: 'order123',
            productId: 'product123',
            quantity: 2,
            price: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: {
              id: 'product123',
              name: 'Test Product',
              description: 'A product for testing',
              price: 50,
              stock: 100,
              isAvailable: true,
              categories: [
                {
                  id: 1,
                  name: 'Category 1',
                  description: 'Test Category 1',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  id: 2,
                  name: 'Category 2',
                  description: 'Test Category 2',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              images: [
                {
                  id: 'image1',
                  url: 'image1.jpg',
                  productId: 'product123',
                  imageUrl: 'image1.jpg',
                  publicId: 'public1',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      const mockPaymentIntent = {
        id: 'pi_12345',
        client_secret: 'secret_12345',
        payment_method_types: ['card'],
      };

      jest
        .spyOn(prismaService.paymentDetails, 'findFirst')
        .mockResolvedValue(null);

      jest.spyOn(orderService, 'getOrderById').mockResolvedValue(mockOrder);

      const stripePaymentIntentsCreateSpy = jest
        .spyOn((stripeService as any).stripe.paymentIntents, 'create')
        .mockResolvedValue(mockPaymentIntent as any);

      jest
        .spyOn(prismaService.paymentDetails, 'create')
        .mockResolvedValue(undefined);

      const result = await stripeService.createPaymentIntent(orderId, user);

      expect(prismaService.paymentDetails.findFirst).toHaveBeenCalledWith({
        where: { orderId },
      });

      expect(orderService.getOrderById).toHaveBeenCalledWith(orderId, user);

      expect(stripePaymentIntentsCreateSpy).toHaveBeenCalledWith({
        amount: 200,
        currency: 'usd',
        metadata: { orderId },
      });

      expect(prismaService.paymentDetails.create).toHaveBeenCalledWith({
        data: {
          paymentIntentId: mockPaymentIntent.id,
          paymentMethodId: 'card',
          order: { connect: { id: orderId } },
          amount: 200,
          status: { connect: { id: 1 } },
          paymentDate: expect.any(Date),
        },
      });

      expect(result).toEqual({ clientSecret: mockPaymentIntent.client_secret });
    });

    it('should throw NotAcceptableException if payment already exists', async () => {
      const orderId = 'order123';
      const user = { id: 'user123', role: RoleName.CLIENT };

      jest.spyOn(prismaService.paymentDetails, 'findFirst').mockResolvedValue({
        id: 'payment123',
        paymentIntentId: 'pi_12345',
        paymentMethodId: 'card',
        orderId: orderId,
        amount: 200,
        statusId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentDate: new Date(),
      });

      jest.spyOn(orderService, 'getOrderById').mockResolvedValue({
        id: orderId,
        userId: user.id,
        address: '123 Test Street',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderDetails: [],
      });

      await expect(
        stripeService.createPaymentIntent(orderId, user),
      ).rejects.toThrow(NotAcceptableException);

      expect(prismaService.paymentDetails.findFirst).toHaveBeenCalledWith({
        where: { orderId },
      });
    });
  });

  describe('handleStripeWebhook', () => {
    it('should handle a successful payment intent webhook', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_12345',
            metadata: { orderId: 'order123' },
            amount: 200,
            payment_method: 'card',
          },
        },
      };

      const mockPayload = Buffer.from(JSON.stringify(mockEvent));
      const mockHeaders = { 'stripe-signature': 'valid-signature' };

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockReturnValue(mockEvent as any);

      jest
        .spyOn(prismaService.paymentDetails, 'update')
        .mockResolvedValue(undefined);

      await stripeService.handleStripeWebhook(mockPayload, mockHeaders);

      expect(prismaService.paymentDetails.update).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_12345' },
        data: {
          statusId: 2,
          paymentMethodId: 'card',
          amount: 200,
          updatedAt: expect.any(Date),
          paymentDate: expect.any(Date),
        },
      });
    });

    it('should handle a failed payment intent webhook', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_12345',
            metadata: { orderId: 'order123' },
          },
        },
      };

      const mockPayload = Buffer.from(JSON.stringify(mockEvent));
      const mockHeaders = { 'stripe-signature': 'valid-signature' };

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockReturnValue(mockEvent as any);

      jest
        .spyOn(prismaService.paymentDetails, 'update')
        .mockResolvedValue(undefined);

      await stripeService.handleStripeWebhook(mockPayload, mockHeaders);

      expect(prismaService.paymentDetails.update).toHaveBeenCalledWith({
        where: { paymentIntentId: 'pi_12345' },
        data: {
          statusId: 3,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotAcceptableException for invalid webhook signature', async () => {
      const mockPayload = Buffer.from(JSON.stringify({}));
      const mockHeaders = { 'stripe-signature': 'invalid-signature' };

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockImplementation(() => {
          throw new NotAcceptableException('Invalid signature');
        });

      await expect(
        stripeService.handleStripeWebhook(mockPayload, mockHeaders),
      ).rejects.toThrow(NotAcceptableException);
    });

    it('should log a warning for unhandled event types', async () => {
      const mockEvent = {
        type: 'unknown.event',
        data: {
          object: {
            id: 'pi_12345',
            metadata: { orderId: 'order123' },
          },
        },
      };

      const mockPayload = Buffer.from(JSON.stringify(mockEvent));
      const mockHeaders = { 'stripe-signature': 'valid-signature' };
      const loggerWarnSpy = jest.spyOn((stripeService as any).logger, 'warn');

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockReturnValue(mockEvent as any);

      await stripeService.handleStripeWebhook(mockPayload, mockHeaders);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Unhandled event type: unknown.event',
      );
    });

    it('should handle successful payment intent with missing orderId', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_12345',
            metadata: {}, // Missing orderId
            amount: 200,
            payment_method: 'card',
          },
        },
      };

      const mockPayload = Buffer.from(JSON.stringify(mockEvent));
      const mockHeaders = { 'stripe-signature': 'valid-signature' };
      const loggerErrorSpy = jest.spyOn((stripeService as any).logger, 'error');

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockReturnValue(mockEvent as any);

      await stripeService.handleStripeWebhook(mockPayload, mockHeaders);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Payment Intent missing orderId metadata.',
      );
      expect(prismaService.paymentDetails.update).not.toHaveBeenCalled();
    });

    it('should handle failed payment intent with missing orderId', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_12345',
            metadata: {},
          },
        },
      };

      const mockPayload = Buffer.from(JSON.stringify(mockEvent));
      const mockHeaders = { 'stripe-signature': 'valid-signature' };
      const loggerErrorSpy = jest.spyOn((stripeService as any).logger, 'error');

      jest
        .spyOn((stripeService as any).stripe.webhooks, 'constructEvent')
        .mockReturnValue(mockEvent as any);

      await stripeService.handleStripeWebhook(mockPayload, mockHeaders);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Payment Intent missing orderId metadata.',
      );
      expect(prismaService.paymentDetails.update).not.toHaveBeenCalled();
    });
  });
});

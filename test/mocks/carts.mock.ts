import { Carts, CartItems } from '@prisma/client';
import { UpdateProductCartRes } from '../../src/carts/dto/res/index.res';

export class CartServiceMocks {
  static cart: Carts = {
    id: 'bb42fe24-f701-438e-923a-a7cae23f2ff8',
    userId: 'u1234567-89ab-cdef-0123-456789abcdef',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static notAcceptableExceptionCart: Carts = {
    id: 'cart5678',
    userId: 'anotherUser123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static cartItemToGetCartById = [
    {
      id: 'item5678',
      cartId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      productId: 'prod5678',
      quantity: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 'prod5678',
        name: 'Updated Sample Product',
        description: 'Updated test description',
        stock: 20,
        isAvailable: true,
        price: 150,
        categories: [],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];

  static cartToGetCartByUserId = (userId: string) => {
    return {
      id: 'cart9876',
      userId,
      cartItems: [
        {
          id: 'item9876',
          productId: 'prod9876',
          quantity: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 'prod9876',
            name: 'Another Sample Product', // Adjusted for `CartType`
            description: 'Another updated description',
            stock: 30,
            isAvailable: true,
            price: 200,
            categories: [],
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  static cartFromDeleteProductFromCart: Carts = {
    id: 'cart6543',
    userId: 'user6543',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static cartItemToDelete: CartItems = {
    id: 'item6543',
    createdAt: new Date(),
    updatedAt: new Date(),
    cartId: 'cart6543',
    productId: 'prod6543',
    quantity: 1,
  };

  static newUpsertCartItem = (
    cartId: string,
    productId: string,
    quantity: number,
  ) => {
    return {
      id: 'newCartItem1234',
      cartId,
      productId,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  static cartItem: CartItems = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    quantity: 1,
    cartId: 'bb42fe24-f701-438e-923a-a7cae23f2ff8',
    productId: 'b1c2d3e4-f5g6-7890-hijk-lm1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static updatedCartItem: UpdateProductCartRes = {
    updatedAt: new Date(),
  };
}

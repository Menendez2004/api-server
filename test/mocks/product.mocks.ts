import { Products } from '@prisma/client';

export class MocksProductService {
  static defaultProductMock: Products = {
    id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
    name: 'Product 0',
    description: 'Description 0',
    stock: 10,
    isAvailable: true,
    price: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static productWithMinimalStock: Products = {
    id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
    name: ' low stock product',
    description: 'low stock product',
    stock: 10,
    isAvailable: true,
    price: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static productToRemoveFromCart: Products = {
    id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
    name: 'existing product',
    description: 'existing product',
    stock: 9,
    isAvailable: true,
    price: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static paginationProductMock: Products[] = [
    {
      id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
      name: 'Product 1',
      description: 'Description 1',
      stock: 10,
      isAvailable: true,
      price: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
      name: 'Product 2',
      description: 'Description 2',
      stock: 10,
      isAvailable: true,
      price: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '7e5756a7-a3cb-45b8-b36c-3d28094f1cba',
      name: 'Product 3',
      description: 'Description 3',
      stock: 10,
      isAvailable: true,
      price: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

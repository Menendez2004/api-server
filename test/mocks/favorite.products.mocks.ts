export class FavoriteServiceMocks {
  static currentDate = new Date();

  static newFavorite = (
    userId: string,
    productId: string,
    overrides: Partial<{ id: string; createdAt: Date; updatedAt: Date }> = {},
  ) => {
    return {
      id: overrides.id || 'favorite123',
      userId: userId,
      productId: productId,
      createdAt: overrides.createdAt || this.currentDate,
      updatedAt: overrides.updatedAt || this.currentDate,
    };
  };

  static existingFavorite = FavoriteServiceMocks.newFavorite(
    'user123',
    'product123',
  );

  static userFavorites = [
    {
      id: 'favorite1',
      userId: 'user123',
      productId: 'product1',
      product: {
        id: 'product1',
        productName: 'Product 1',
        description: 'Sample product 1',
        stock: 10,
        isAvailable: true,
        unitPrice: 100,
        categories: [],
        images: [],
        createdAt: this.currentDate,
        updatedAt: this.currentDate,
      },
      createdAt: this.currentDate,
      updatedAt: this.currentDate,
    },
  ];
}

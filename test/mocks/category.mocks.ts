import { CreateCategoryRes } from '../../src/categories/dto/res/index.category.res';

export class ShoeCategoryServiceMocks {
  static createMockCategory(
    overrides: Partial<{
      id: number;
      name: string;
      description?: string;
      parentId?: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ) {
    return {
      id: overrides.id ?? 1,
      name: overrides.name ?? 'Athletic Shoes',
      createdAt: overrides.createdAt ?? this.currentDate,
    };
  }
  static currentDate = new Date();

  static category = this.createMockCategory();

  static anotherCategory = this.createMockCategory({
    id: 2,
    name: 'Casual Shoes',
    description: 'Everyday comfortable footwear',
  });

  static childCategory = this.createMockCategory({
    id: 3,
    name: 'Running Shoes',
    description: 'Shoes designed for running and jogging',
    parentId: 1,
  });

  static allCategories = [
    this.category,
    this.anotherCategory,
    this.childCategory,
    this.createMockCategory({
      id: 4,
      name: 'Formal Shoes',
      description: 'Business and formal occasion footwear',
    }),
    this.createMockCategory({
      id: 5,
      name: 'Boots',
      description: 'Various styles of boots',
    }),
  ];

  static createCategoryResponse: CreateCategoryRes = {
    id: 1,
    name: 'Athletic Shoes',
    createdAt: this.currentDate,
  };

  static categoryInUse = {
    categoryId: 1,
    productId: 'product123',
    createdAt: this.currentDate,
    updatedAt: this.currentDate,
  };

  static deletedCategory = {
    deleted: true,
  };

  /**
   * Creates a batch of mock categories
   * @param count - Number of categories to create
   * @returns Array of mock categories
   */
  static createMockCategories(count: number) {
    return Array.from({ length: count }, (_, index) =>
      this.createMockCategory({
        id: index + 1,
        name: `Test Category ${index + 1}`,
        description: `Test Description ${index + 1}`,
      }),
    );
  }

  static createMockHierarchy() {
    const parent = this.createMockCategory({
      id: 1,
      name: 'Athletic Shoes',
    });

    const children = [
      this.createMockCategory({
        id: 2,
        name: 'Running Shoes',
        parentId: parent.id,
      }),
      this.createMockCategory({
        id: 3,
        name: 'Training Shoes',
        parentId: parent.id,
      }),
    ];

    return { parent, children };
  }

  static responseTypes = {
    remove: {
      success: { deleted: true },
      notFound: 'Category not found',
      inUse: 'Category is in use',
    },
    getAll: this.allCategories,
  };
}

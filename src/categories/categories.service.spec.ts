import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { CreateCategoryRes } from './dto/res/create.category.res';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShoeCategoryServiceMocks } from '../../test/mocks/category.mocks';
import { plainToInstance } from 'class-transformer';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let mockedPrismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      categories: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      productCategories: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    categoriesService = module.get(CategoriesService);
    mockedPrismaService = module.get(PrismaService);
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryName = 'testing';

      (
        mockedPrismaService.categories.findUnique as jest.Mock
      ).mockResolvedValue(null);

      (mockedPrismaService.categories.create as jest.Mock).mockResolvedValue(
        ShoeCategoryServiceMocks.createMockCategory(),
      );

      const result = await categoriesService.createCategory(categoryName);

      expect(mockedPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { name: categoryName },
      });

      expect(mockedPrismaService.categories.create).toHaveBeenCalledWith({
        data: { name: categoryName },
      });

      expect(result).toEqual(
        plainToInstance(
          CreateCategoryRes,
          ShoeCategoryServiceMocks.createCategoryResponse,
        ),
      );
    });

    it('should throw BadRequestException if category already exists', async () => {
      const categoryName = 'testing';
      (
        mockedPrismaService.categories.findUnique as jest.Mock
      ).mockResolvedValue(ShoeCategoryServiceMocks.category);

      await expect(
        categoriesService.createCategory(categoryName),
      ).rejects.toThrow(BadRequestException);

      expect(mockedPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { name: categoryName },
      });
    });
  });

  describe('removeCategory', () => {
    it('should delete a category if not in use', async () => {
      const categoryId = 1;

      (
        mockedPrismaService.categories.findUnique as jest.Mock
      ).mockResolvedValue(ShoeCategoryServiceMocks.category);
      (
        mockedPrismaService.productCategories.findMany as jest.Mock
      ).mockResolvedValue([]);
      (mockedPrismaService.categories.delete as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await categoriesService.removeCategory(categoryId);

      expect(mockedPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });

      expect(
        mockedPrismaService.productCategories.findMany,
      ).toHaveBeenCalledWith({
        where: { categoryId: categoryId },
      });

      expect(mockedPrismaService.categories.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });

      expect(result).toMatchObject(ShoeCategoryServiceMocks.deletedCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 1;
      (
        mockedPrismaService.categories.findUnique as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        categoriesService.removeCategory(categoryId),
      ).rejects.toThrow(NotFoundException);

      expect(mockedPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should throw BadRequestException if category is in use', async () => {
      const categoryId = 1;

      (
        mockedPrismaService.categories.findUnique as jest.Mock
      ).mockResolvedValue(ShoeCategoryServiceMocks.category);

      (
        mockedPrismaService.productCategories.findMany as jest.Mock
      ).mockResolvedValue([ShoeCategoryServiceMocks.categoryInUse]);

      await expect(
        categoriesService.removeCategory(categoryId),
      ).rejects.toThrow(BadRequestException);

      expect(mockedPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockedPrismaService.productCategories.findMany).toHaveBeenCalled();
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      (mockedPrismaService.categories.findMany as jest.Mock).mockResolvedValue(
        ShoeCategoryServiceMocks.allCategories,
      );

      const result = await categoriesService.getAllCategories();

      expect(mockedPrismaService.categories.findMany).toHaveBeenCalled();
      expect(result).toEqual(ShoeCategoryServiceMocks.allCategories);
    });

    it('should throw NotFoundException if no categories are found', async () => {
      (mockedPrismaService.categories.findMany as jest.Mock).mockResolvedValue(
        [],
      );

      await expect(categoriesService.getAllCategories()).rejects.toThrow(
        NotFoundException,
      );

      expect(mockedPrismaService.categories.findMany).toHaveBeenCalled();
    });
  });
});

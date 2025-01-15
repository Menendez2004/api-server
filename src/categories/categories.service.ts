import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Categories } from '@prisma/client';
import { PrismaService } from '../helpers/prisma/prisma.service';
import {
  CreateCategoryRes,
  RemoveCategoryRes,
} from './dto/res/index.category.res';
import { plainToInstance } from 'class-transformer';
import {Prisma,} from '@prisma/client';
import { SortinCategoryInput } from './dto/category.sorting.input';
import { PaginationInput } from '../helpers/pagination/index.pagination';
import { CategoryPaginationFilter } from './filters/category.pagination.filter';
import { CategoryPagination } from './dto/category.pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories(
      filters?: CategoryPaginationFilter,
      sortBy?: SortinCategoryInput,
      pagination?: PaginationInput,
    ): Promise<CategoryPagination> {
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 20;
  
      const where = {
        ...(filters?.categoryId && {
          categoryId: { equals: filters.categoryId },
        }),
        ...(filters?.name && {
          name: { contains: filters.name, mode: Prisma.QueryMode.insensitive },
        }),
      };
  
      const orderBy = sortBy
        ? [{ [sortBy.field]: sortBy.order as 'asc' | 'desc' }]
        : [{ name: 'desc' as 'asc' | 'desc' }];
  
      const [items, totalItems] = await Promise.all([
        this.prisma.categories.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.categories.count({ where }),
      ]);
  
      const totalPages = Math.ceil(totalItems / limit);
      const meta = {
        totalItems,
        totalPages,
        limit,
        page,
      };
  
      return {
        collection: items,
        meta,
      };
    }

  async createCategory(name: string): Promise<CreateCategoryRes> {
    const foundCategory = await this.findCategoryByName(name);
    if (foundCategory) {
      throw new BadRequestException(
        `Category with name ${name} already exists`,
      );
    }
    

    const cretatedCategory = await this.prisma.categories.create({
      data: { name }, 
    });
    return plainToInstance(CreateCategoryRes, cretatedCategory);
  }

  async removeCategory(id: number): Promise<RemoveCategoryRes> {
    const existingCategory = await this.prisma.categories.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException(
        `looks like the category with id ${id} does not exist`,
      );
    }
    const producCategories = await this.prisma.productCategories.findMany({
      where: { categoryId: id },
    });
    if (producCategories.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with products, this has products associated with it: 
                ${producCategories.map((p) => p.productId).join(', ')}`,
      );
    }
    await this.prisma.categories.delete({
      where: { id },
    });

    return plainToInstance(RemoveCategoryRes, { deleted: true });
  }

  async getAllCategories() {
    const categories = await this.prisma.categories.findMany();

    if (!categories.length) {
      throw new NotFoundException('No categories found');
    }

    return categories;
  }

  private async findCategoryByName(name: string): Promise<Categories | null> {
    return this.prisma.categories.findUnique({
      where: { name },
    });
  }
}

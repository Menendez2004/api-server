import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { Logger, UseFilters } from '@nestjs/common';
import {
  CreateCategoryReq,
  RemoveCategoryReq,
} from './dto/req/index.category.req';
import {
  CreateCategoryRes,
  RemoveCategoryRes,
} from './dto/res/index.category.res';
import { AuthRole } from '../auth/decorators/auth.roles.decorator';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { CategoriesService } from './categories.service';
import { CategoryPagination } from './dto/category.pagination.dto';
import { CategoryPaginationFilter } from './filters/category.pagination.filter';
import { SortinCategoryInput } from './dto/category.sorting.input';
import { PaginationInput } from '../helpers/pagination/index.pagination';

@Resolver()
@UseFilters(new GlobalExceptionFilter())
export class CategoriesResolver {
  private readonly logger = new Logger(CategoriesResolver.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @AuthRole('MANAGER')
  @Mutation(() => CreateCategoryRes)
  async createCategory(
    @Args('data') { name }: CreateCategoryReq,
  ): Promise<CreateCategoryRes> {
    this.logger.log(`Request to create a category with name: ${name}`);
    const category = await this.categoriesService.createCategory(name);
    this.logger.log(`Category created: ${category.id}`);
    return category;
  }

  @Query(() => CategoryPagination)
  async findAllCategories(
    @Args('filters', { nullable: true }) filters?: CategoryPaginationFilter,
    @Args('sortBy', { nullable: true }) sortBy?: SortinCategoryInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<CategoryPagination> {
    return await this.categoriesService.findAllCategories(
      filters,
      sortBy,
      pagination,
    );
  }

  @AuthRole('MANAGER')
  @Mutation(() => RemoveCategoryRes)
  async removeCategory(
    @Args('id') { id }: RemoveCategoryReq,
  ): Promise<RemoveCategoryRes> {
    return await this.categoriesService.removeCategory(id);
  }
}

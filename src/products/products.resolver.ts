import { UseFilters } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductsTypes } from './types/products.types';
import { ProductsService } from './products.service';
import { AuthRole } from '../auth/decorators/auth.roles.decorator';
import { CreateProductsRes } from './dto/res/products.create.res';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { CreateProductInput } from './dto/products.create.input';
import { plainToInstance } from 'class-transformer';
import { DeletedProductsRes, UpdateProductRes } from './dto/res/index.res';
import { ProductsPagination } from './dto/products.pagination';
import { ProductFiltersInput } from './dto/filters/product.input.filter';
import { SortingProductInput } from './dto/products.sorting.input';
import { PaginationInput } from '../helpers/pagination/pagination.input';
import { UpdateProductInput } from './dto/index.dto';
import { ProductImages } from '@prisma/client';
import { UpdateProductArg } from './dto/args/update.product.args';
import { ImagesTypes } from './types/images.type';

@Resolver(() => ProductsTypes)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @AuthRole('MANAGER')
  @Mutation(() => CreateProductsRes)
  @UseFilters(new GlobalExceptionFilter())
  async createProduct(
    @Args('data') data: CreateProductInput,
  ): Promise<CreateProductsRes> {
    const product = await this.productsService.createProduct(data);
    return plainToInstance(CreateProductsRes, product);
  }

  @AuthRole('MANAGER')
  @Mutation(() => UpdateProductRes)
  @UseFilters(new GlobalExceptionFilter())
  async updateProduct(
    @Args('id') id: string,
    @Args('data') data: UpdateProductArg,
  ): Promise<UpdateProductRes> {
    return this.productsService.updateProductData(id, data);
  }

  @AuthRole('MANAGER')
  @Mutation(() => DeletedProductsRes)
  @UseFilters(new GlobalExceptionFilter())
  async removeProduct(@Args('id') id: string): Promise<DeletedProductsRes> {
    await this.productsService.removeProduct(id);
    const res = new DeletedProductsRes();
    res.deletedAt = new Date();
    return res;
  }

  
  @Query(() => ProductsPagination)
  async findAllProducts(
    @Args('filters', { nullable: true }) filters?: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy?: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ProductsPagination> {
    return this.productsService.findAll(filters, sortBy, pagination);
  }

  @Query(() => [ImagesTypes])
  async getProductImages(
    @Args('productId') productId: string,
  ): Promise<ProductImages[]> {
    return this.productsService.getProductImages(productId);
  }

  @Query(() => Number)
  async getProductPrice(@Args('productId') productId: string): Promise<number> {
    return this.productsService.getProductPrice(productId);
  }
}

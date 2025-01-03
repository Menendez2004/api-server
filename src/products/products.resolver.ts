import { UseFilters } from '@nestjs/common';
import {
    Args,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql';
import { ProductsTypes } from './types/products.types';
import { ProductsService } from './products.service';
import { Auth } from 'src/auth/decorators/auth.roles.decorator';
import { CreateProductsRes } from './res/products.create.res';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { CreateProductInput } from './dto/products.create.input';
import { plainToInstance } from 'class-transformer';
import { DeletedProductsRes } from './res/products.remove.res';
import { ProductsPagination } from './dto/products.pagination';
import { ProductFiltersInput } from './dto/filters/product.input.filter';
import { SortingProductInput } from './dto/products.sorting.input';
import { PaginationInput } from 'src/helpers/pagination/pagination.input';

@Resolver(() => ProductsTypes)
export class ProductsResolver {

    constructor(private readonly productsService: ProductsService) { }

    @Auth('MANAGER')
    @Mutation(() => CreateProductsRes )
    @UseFilters( new GlobalExceptionFilter())
    async createProduct(@Args('data') data: CreateProductInput): Promise<CreateProductsRes> {
        const product = await this.productsService.createProduct(data);
        return plainToInstance(CreateProductsRes, product);
    }

    @Auth('MANAGER')
    @Mutation(() => DeletedProductsRes)
    @UseFilters( new GlobalExceptionFilter())
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

}

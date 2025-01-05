import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { Logger, UseFilters } from '@nestjs/common';
import { CategoriesClass } from './classes/categories.class';
import { CreateCategoryReq, RemoveCategoryReq } from './dto/req/index.category.req';
import { CreateCategoryRes, RemoveCategoryRes } from './dto/res/index.category.res';
import { AuthRole } from 'src/auth/decorators/auth.roles.decorator';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { CategoriesService } from './categories.service';


@Resolver()
@UseFilters(new GlobalExceptionFilter())
export class CategoriesResolver {
    private readonly logger = new Logger(CategoriesResolver.name);

    constructor(private readonly categoriesService: CategoriesService) { }

    @AuthRole('MANAGER')
    @Mutation(() => CreateCategoryRes, {
        name: 'category creation',
        description: 'Create a new category in the system. Requires MANAGER role.',
    })
    async createCategory(
        @Args('data') { name }: CreateCategoryReq
    ): Promise<CreateCategoryRes> {
        this.logger.log(`Request to create a category with name: ${name}`);
        const category = await this.categoriesService.createCategory(name);
        this.logger.log(`Category created: ${category.id}`);
        return category;
        
        //     try {
        //         const category = await this.categoriesService.createCategory(name)
        //         this.logger.log(`Category created: ${category.id}`);
        //         return category;
        //     } catch (err) {
        //         this.logger.error(`Error creating category: ${err}`);
        //         throw err;
        //     }
        // }
    }


    @AuthRole('MANAGER')
    @Mutation(() => RemoveCategoryRes, {
        name: 'category removal',
        description: 'Remove a category from the system. Requires MANAGER role.',
    })
    async removeCategory(
        @Args('id') { id }: RemoveCategoryReq
    ): Promise<RemoveCategoryRes> {
        this.logger.log(`Request to remove category with ID: ${id}`);

        await this.categoriesService.removeCategory(id);
        this.logger.log(`Category successfully removed: ${id}`);
        return { id };
    }

    @AuthRole('MANAGER', 'CLIENT')
    @Query(() => [CategoriesClass], {
        name: 'categories',
        description: 'Get all categories in the system. Requires MANAGER or CLIENT role.',
    })
    async getCategories(): Promise<CategoriesClass[]> {
        this.logger.log(`Fetching categories for a user with authorized roles: MANAGER or CLIENT`);
        const categories = await this.categoriesService.getAllCategories();
        this.logger.log(`Found ${categories.length} categories`);
        return categories;
    }
}

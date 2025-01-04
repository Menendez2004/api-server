import {
    Injectable,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { Categories } from '@prisma/client';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { RemoveCategoryReq, CreateCategoryReq } from './dto/req/index.category.req';
import { CreateCategoryRes, RemoveCategoryRes } from './dto/res/index.category.res';
import { plainToInstance } from 'class-transformer';
import { CategoriesClass } from './classes/categories.class';


@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    async createCategory(name: string): Promise<CreateCategoryRes>{
        const foundCategory  = await this.findCategoryByName ( name);
        if (foundCategory ) {
            throw new BadRequestException(`Category with name ${name} already exists`);
        }

        const cretatedCategory = await this.prisma.categories.create({
            data:{name}//should add descriptions for this???? review later
        });
        return plainToInstance(CreateCategoryRes, cretatedCategory);
    }

    async removeCategory(id: number): Promise<RemoveCategoryRes>{
        const existingCategory = await this.prisma.categories.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            throw new NotFoundException(`looks like the category with id ${id} does not exist`);
        }
        const producCategories = await this.prisma.productCategories.findMany({
            where: { categoryId: id }// should be another fucntion?? (review later!!!)
        })
        if (producCategories.length > 0) {
            throw new BadRequestException(
                `Cannot delete category with products, this has products associated with it: 
                ${producCategories.map((p) => p.productId).join(', ')}` //it gonna return the id of the products associated with the category
            );
        }
        await this.prisma.categories.delete({
            where: { id }
        });

        return plainToInstance(RemoveCategoryRes, {deleted: true});
    } 

    async getAllCategories(): Promise<CategoriesClass[]>{
        const categories = await this.prisma.categories.findMany();
        if (!categories) {
            throw new NotFoundException('No categories found');
        }
        const transformedCategories  = categories.map(
            (category) => plainToInstance
                            (CategoriesClass, category));

        return transformedCategories ;
    }


    private async findCategoryByName (name: string): Promise<Categories | null>{
        return this.prisma.categories.findUnique({
            where: { name }
        })
    }
}

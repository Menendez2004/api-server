import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Products } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ValidatorService {
    constructor(private readonly prisma: PrismaService) { }

    async findOneProductById(
        where: Prisma.ProductsWhereUniqueInput,
        includeCategory: boolean = true,
    ) {
        const product = await this.prisma.products.findUnique({
            where,
            include: {
                Categories: includeCategory,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findProductExitence(id: string): Promise<Products>{
        const products = await this.prisma.products.findUnique({
            where: {
                id,
            },
        });
        if (!products) {
            throw new NotFoundException('look like the product does not exist');
        }
        return products;
    }
}
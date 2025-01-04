import { Injectable } from '@nestjs/common';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { Favorites } from '@prisma/client';
import { FavoriteType } from './types/favorite.product.type';
import { ProductsTypes } from '../products/types/products.types';
import {RemoveFavoriteRes, AddFavoriteRes} from './dto/res/index.favorites.res'

@Injectable()
export class FavoritesService {
    constructor(private readonly prismaService: PrismaService) { }

    async checkOrUncheckAsFavorite(
        userId: string,
        productId: string,
    ): Promise<AddFavoriteRes | RemoveFavoriteRes> {
        const existingFavorite = await this.prismaService.favorites.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingFavorite) {
            await this.removeFavorite(existingFavorite.id);
            return this.createRemoveFavoriteResponse();
        }

        const newFavorite = await this.addFavorite(userId, productId);
        return plainToInstance(AddFavoriteRes, newFavorite);
    }

    async getFavoritesOwns(userId: string): Promise<FavoriteType[]> {
        const favorites = await this.prismaService.favorites.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        Categories: true,
                        images: true,
                    },
                },
            },
        });

        const favoriteTypes = favorites.map((favorite) => {
            const product = favorite.product;
            const productType = plainToInstance(ProductsTypes, product);
            return {
                ...favorite,
                product: productType,
            };
        });

        return favoriteTypes;
    }

    private async removeFavorite(favoriteId: string): Promise<void> {
        await this.prismaService.favorites.delete({
            where: { id: favoriteId },
        });
    }

    private createRemoveFavoriteResponse(): RemoveFavoriteRes {
        const response = new RemoveFavoriteRes();
        response.deletedAt = new Date();
        return response;
    }

    private async addFavorite(
        userId: string,
        productId: string,
    ): Promise<Favorites> {
        return this.prismaService.favorites.create({
            data: {
                user: { connect: { id: userId } },
                product: { connect: { id: productId } },
            },
        });
    }
}

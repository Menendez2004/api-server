import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { Favorites } from '@prisma/client';
import { FavoriteType } from './types/favorite.product.types';
import { ProductsTypes } from '../products/types/products.types';
import {
  RemoveFavoriteRes,
  AddFavoriteRes,
} from './dto/res/index.favorites.res';

@Injectable()
export class FavoritesService {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleFavoriteStatus(
    userId: string,
    productId: string,
  ): Promise<AddFavoriteRes | RemoveFavoriteRes> {
    const foundFavorite = await this.prismaService.favorites.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
    });

    if (foundFavorite) {
      await this.removeFavorite(foundFavorite.id);
      return this.createRemoveFavoriteResponse();
    }

    const newFavorite = await this.addFavorite(userId, productId);
    return plainToInstance(AddFavoriteRes, newFavorite);
  }

  async getUserFavorites(userId: string): Promise<FavoriteType[]> {
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
      const transformedFavorites = plainToInstance(ProductsTypes, product);
      return {
        ...favorite,
        product: transformedFavorites,
      };
    });

    return favoriteTypes;
  }

  async removeFavorite(favoriteId: string): Promise<void> {
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

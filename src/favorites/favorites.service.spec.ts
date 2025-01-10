import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { AddFavoriteRes } from './dto/res/index.favorites.res';
import { FavoriteServiceMocks } from '../../test/mocks/favorite.products.mocks';
import { ProductsTypes } from '../products/types/index.types';
import { MocksProductService } from '../../test/mocks/product.mocks';
import { ValidatorService } from '../helpers/service/validator.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prismaService: PrismaService;
  let validatorService: ValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: {
            favorites: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },

        {
          provide: ValidatorService,
          useValue: {
            ensureProductExists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prismaService = module.get<PrismaService>(PrismaService);
    validatorService = module.get<ValidatorService>(ValidatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFavoriteStatus', () => {
    it('should add a favorite if it does not exist', async () => {
      const userId = 'user123';
      const productId = 'product123';

      (validatorService.ensureProductExists as jest.Mock).mockResolvedValue(
        MocksProductService.defaultProductMock,
      );
      (prismaService.favorites.findUnique as jest.Mock).mockResolvedValue(null);

      (prismaService.favorites.create as jest.Mock).mockResolvedValue(
        FavoriteServiceMocks.newFavorite(userId, productId),
      );

      const result = await service.toggleFavoriteStatus(userId, productId);

      expect(prismaService.favorites.findUnique).toHaveBeenCalled();
      expect(prismaService.favorites.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });
      expect(prismaService.favorites.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: userId } },
          product: { connect: { id: productId } },
        },
      });
      expect(result).toEqual(
        plainToInstance(
          AddFavoriteRes,
          FavoriteServiceMocks.newFavorite(userId, productId),
        ),
      );
    });

    it('should remove a favorite if it already exists', async () => {
      const userId = 'user123';
      const productId = 'product123';

      jest.spyOn(service, 'removeFavorite').mockResolvedValue(null);

      (prismaService.favorites.findUnique as jest.Mock).mockResolvedValue(
        FavoriteServiceMocks.existingFavorite,
      );

      (service.removeFavorite as jest.Mock).mockResolvedValue(null);

      const result = await service.toggleFavoriteStatus(userId, productId);

      expect(service.removeFavorite).toHaveBeenCalledWith(
        FavoriteServiceMocks.existingFavorite.id,
      );

      expect(result).toEqual(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getUserFavorites', () => {
    it('should return the user’s favorite products', async () => {
      const userId = 'user123';

      jest
        .spyOn(prismaService.favorites, 'findMany')
        .mockResolvedValue(FavoriteServiceMocks.userFavorites);

      const result = await service.getUserFavorites(userId);

      expect(prismaService.favorites.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: {
          product: {
            include: {
              Categories: true,
              images: true,
            },
          },
        },
      });

      expect(result).toEqual(
        FavoriteServiceMocks.userFavorites.map((favorite) => ({
          ...favorite,
          product: plainToInstance(ProductsTypes, favorite.product),
        })),
      );
    });

    it('should return an empty array if no favorites are found', async () => {
      const userId = 'user123';
      jest.spyOn(prismaService.favorites, 'findMany').mockResolvedValue([]);

      const result = await service.getUserFavorites(userId);

      expect(prismaService.favorites.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: {
          product: {
            include: {
              Categories: true,
              images: true,
            },
          },
        },
      });

      expect(result).toEqual([]);
    });
  });
});

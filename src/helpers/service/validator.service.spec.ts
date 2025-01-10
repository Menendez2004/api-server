import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ValidatorService } from './validator.service';
import { NotFoundException } from '@nestjs/common';
import { MocksProductService } from '../../../test/mocks/product.mocks';

class PrismaServiceMock {
  products = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  };
}

describe('ValidatorService', () => {
  let service: ValidatorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidatorService,
        {
          provide: PrismaService,
          useClass: PrismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<ValidatorService>(ValidatorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneProductById', () => {
    it('should return a product if it exists', async () => {
      const mockId = { id: MocksProductService.defaultProductMock.id };

      jest
        .spyOn(prismaService.products, 'findUnique')
        .mockResolvedValue(MocksProductService.defaultProductMock);

      const result = await service.findOneProductById(mockId);

      expect(result).toEqual(MocksProductService.defaultProductMock);
      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: MocksProductService.defaultProductMock.id },
        include: { Categories: true },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Use the same mockId for both the call and the expectation
      const mockId = { id: MocksProductService.defaultProductMock.id };

      jest.spyOn(prismaService.products, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneProductById(mockId)).rejects.toThrow(
        NotFoundException,
      );

      // Use the same mockId in the expectation
      expect(prismaService.products.findUnique).toHaveBeenCalledWith({
        where: { id: mockId.id },
        include: { Categories: true },
      });
    });

    describe('ensureProductExists', () => {
      it('should resolve if product exists', async () => {
        jest
          .spyOn(prismaService.products, 'findUnique')
          .mockResolvedValue(MocksProductService.defaultProductMock);

        await expect(
          service.ensureProductExists(
            MocksProductService.defaultProductMock.id,
          ),
        ).resolves.not.toThrow();

        expect(prismaService.products.findUnique).toHaveBeenCalledWith({
          where: { id: MocksProductService.defaultProductMock.id },
        });
      });

      it('should throw NotFoundException if product does not exist', async () => {
        jest
          .spyOn(prismaService.products, 'findUnique')
          .mockResolvedValue(null);

        await expect(
          service.ensureProductExists(
            MocksProductService.defaultProductMock.id,
          ),
        ).rejects.toThrow(NotFoundException);

        expect(prismaService.products.findUnique).toHaveBeenCalledWith({
          where: { id: MocksProductService.defaultProductMock.id },
        });
      });
    });
  });
});

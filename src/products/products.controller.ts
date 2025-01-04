import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param, Patch,
    UploadedFiles,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Auth } from 'src/auth/decorators/auth.roles.decorator';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { UpdateProductImagesArgs } from './dto/args/update.product.imageArg';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OperationType } from 'src/helpers/enums/operation.type.enum';

@Controller('products')
export class ProductsController {
    constructor(private readonly productSevice: ProductsService) { }

    @Auth('MANAGER')
    @Patch(':productId/Images')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseFilters(new GlobalExceptionFilter())
    @UseInterceptors(FilesInterceptor('images'))
    async updateImages(
        @Param('productId') productId: string,
        @UploadedFiles() images: Express.Multer.File[],
        @Body() updateImage: UpdateProductImagesArgs,
    ): Promise<void> {
        this.validateUpdateImagesRequest(updateImage, images);

        if (updateImage.operation === OperationType.ADD) {
            for (const uploadedImage of images) {
                await this.productSevice.uploadImage(productId, uploadedImage);
            }
        } else if (updateImage.operation === OperationType.REMOVE) {
            for (const publicImage of updateImage.publicImageId) {
                await this.productSevice.removeProductImages(publicImage);
            }
        }



    }

    private validateUpdateImagesRequest(
        { operation, path, publicImageId }: UpdateProductImagesArgs,
        uploadedImages: Express.Multer.File[],
    ): void {
        if (path !== '/images') {
            throw new BadRequestException(
                'Invalid path. Only "/images" is supported.',
            );
        }
        if (operation === OperationType.ADD && uploadedImages.length === 0) {
            throw new BadRequestException('No images were uploaded,you need to upload at least one image');
        }
        if (operation === OperationType.REMOVE && publicImageId.length === 0) {
            throw new BadRequestException('No images were selected for deletion');
        }
        if( ![OperationType.ADD, OperationType.REMOVE].includes(operation)){
            throw new BadRequestException('Invalid operation type, you need to choose between ADD or REMOVE');
        }
    }
}


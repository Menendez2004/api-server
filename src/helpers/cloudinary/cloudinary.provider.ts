import { v2 as cloudinary } from 'cloudinary';
import { ConfigurationService } from '../configuration/configuration.service';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: (configService: ConfigurationService) => {
        return cloudinary.config({
            cloud_name: configService.cloudinaryCloudName,
            api_key: configService.cloudinaryApiKey,
            api_secret: configService.cloudinaryApiKey
        });
    },
    inject: [ConfigurationService],
};
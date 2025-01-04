import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import * as stremifier from "streamifier";
import { CloudinaryRes } from "./cloudinary.res";

@Injectable()
export class CloudinaryService{
    async uploadFile(file: Express.Multer.File): Promise<CloudinaryRes>{
        return new Promise<CloudinaryRes>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            stremifier.createReadStream(file.buffer).pipe(stream);
        });
    }

    async destroyFile(publiID: string): Promise<CloudinaryRes>{
        return new Promise<CloudinaryRes>((resolve, reject) => {
            cloudinary.uploader.destroy(publiID, (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }
}
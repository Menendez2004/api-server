
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ValidatorService } from "./validator.service";

@Module({
    imports: [PrismaModule],
    providers: [ValidatorService],
    exports: [ValidatorService],
})

export class ValidatorModule {}
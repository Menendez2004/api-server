
import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [ConfigurationService],
    exports: [ConfigurationService],
})
export class ConfigurationModule { }

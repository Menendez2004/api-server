import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'beforeExit'> implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'], // Conditional logging
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
        } catch (error) {
            console.error('Error connecting to Prisma:', error); 
            process.exit(1); 
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Prisma disconnected.'); 
    }

    async enableShutdownHooks(app: import('@nestjs/common').INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}
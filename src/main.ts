import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { join } from 'path';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(
    '/stripe/webhook',
    bodyParser.raw({
      type: 'application/json',
    })
  )
  app.setBaseViewsDir(join(process.cwd(),'src/helpers/template' ));
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

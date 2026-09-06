import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';
import { OmniResponseInterceptor } from './core/common/omni-response.interceptor';
import { OmniExceptionFilter } from './core/common/omni-exception.filter';
import { OmniContextService } from './core/context/omni-context.service';

async function bootstrap() {
  const logger = new Logger('OmniFlowBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // 2. Static File Serving for Uploads
  const uploadsDir = path.join(process.cwd(), 'storage/uploads');
  app.use('/uploads', express.static(uploadsDir));

  // 3. Global Prefix
  app.setGlobalPrefix('api/v1');

  // 4. Global Context, Pipes, Interceptors, and Filters
  const contextService = app.get(OmniContextService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new OmniResponseInterceptor(contextService));
  app.useGlobalFilters(new OmniExceptionFilter(contextService));

  // 5. Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OmniFlow ERP API')
    .setDescription('Enterprise E-Commerce & ERP Core API Engine')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'OmniFlow API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`==================================================`);
  logger.log(`🚀 OmniFlow ERP Core Engine is running!`);
  logger.log(`🌐 API Base URL:  http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Docs:  http://localhost:${port}/api/docs`);
  logger.log(`📁 Static Files:  http://localhost:${port}/uploads`);
  logger.log(`==================================================`);
}

bootstrap();

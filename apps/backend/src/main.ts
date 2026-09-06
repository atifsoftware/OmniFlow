import 'class-validator';
import 'class-transformer';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as path from 'path';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { OmniResponseInterceptor } from './core/common/omni-response.interceptor';
import { OmniExceptionFilter } from './core/common/omni-exception.filter';
import { OmniContextService } from './core/context/omni-context.service';

async function bootstrap() {
  const logger = new Logger('OmniFlowBootstrap');
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(server));

  // Trust proxy for reverse proxies, load balancers, and Cloudflare
  app.set('trust proxy', 1);

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // 2. Cookie Parser
  app.use(cookieParser());

  // 3. HTTP Response Compression (Gzip / Brotli, 60-70% payload reduction)
  app.use(
    compression({
      threshold: 1024, // Only compress responses larger than 1KB to optimize CPU usage
    }),
  );

  // 4. Safe & Compliant CORS
  const configuredOrigin = process.env.CORS_ORIGIN;
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && (!configuredOrigin || configuredOrigin === '*')) {
    logger.warn('⚠️ WARNING: CORS_ORIGIN is set to wildcard or empty in production! Specify exact origins.');
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, CLI, Postman)
      if (!origin) return callback(null, true);
      if (!configuredOrigin || configuredOrigin === '*') {
        return callback(null, origin);
      }
      const allowed = configuredOrigin.split(',').map((o) => o.trim());
      if (allowed.includes(origin)) {
        return callback(null, origin);
      }
      return callback(null, false);
    },
    credentials: true,
  });

  // 4. Static File Serving for Uploads
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

  // 5. Swagger API Documentation (Disabled in production unless explicitly enabled)
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || !isProduction;

  if (enableSwagger) {
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
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`==================================================`);
  logger.log(`🚀 OmniFlow ERP Core Engine is running!`);
  logger.log(`🌐 API Base URL:  http://localhost:${port}/api/v1`);
  if (enableSwagger) {
    logger.log(`📚 Swagger Docs:  http://localhost:${port}/api/docs`);
  }
  logger.log(`📁 Static Files:  http://localhost:${port}/uploads`);
  logger.log(`==================================================`);
}

bootstrap();

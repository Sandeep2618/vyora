import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('VyoraBootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Fully permissive CORS for web (port 3000), Swagger, Postman, and mobile (React Native)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-business-id', 'X-Business-Id', 'idempotency-key', 'Idempotency-Key', '*'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Vyora Business Billing API')
    .setDescription('Version 1 Modular Monolith REST API specification for Vyora billing, inventory, and ledger management. Usable by Vyora Web and future Vyora Mobile (React Native) applications.')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter your JWT token after logging in via /api/v1/auth/login or /api/v1/auth/register',
      in: 'header',
    })
    .addGlobalParameters({
      name: 'x-business-id',
      in: 'header',
      required: false,
      description: 'Optional business ID for multi-tenant scoping. If omitted, your default business is automatically resolved.',
      schema: { type: 'string' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Vyora API Monolith running on http://localhost:${port}/api/v1`);
  logger.log(`Interactive Swagger docs available on http://localhost:${port}/api/v1/docs`);
}

bootstrap();

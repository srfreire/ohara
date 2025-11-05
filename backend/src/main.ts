import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();
  logger.log('CORS enabled');

  // Global prefix for all routes
  app.setGlobalPrefix('v1');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Ohara API')
    .setDescription('REST API for Ohara document management system with AI agent integration')
    .setVersion('1.10.5')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Admin API key for server-to-server authentication',
      },
      'api-key',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.ohara.osix.tech', 'Production')
    .addTag('auth', 'Authentication endpoints (Google OAuth, JWT)')
    .addTag('users', 'User management')
    .addTag('collections', 'User collections with visibility controls')
    .addTag('documents', 'Document management and PDF access')
    .addTag('folders', 'Folder hierarchy management')
    .addTag('comments', 'Comments with threading and text annotations')
    .addTag('reactions', 'Comment reactions (like, love, insight, question, flag)')
    .addTag('items', 'Collection items (documents in collections)')
    .addTag('agent', 'AI agent chat integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Ohara API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application started successfully`);
  logger.log(`📡 Server running on: http://localhost:${port}/v1`);
  logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error.stack);
  process.exit(1);
});

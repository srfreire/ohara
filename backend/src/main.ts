import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as openApiSpec from './docs/openapi.json';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Register global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  // Add X-API-Version header to all responses
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-API-Version', '2.0');
    next();
  });

  // Swagger API Documentation - loaded from external OpenAPI spec
  SwaggerModule.setup('api/docs', app, openApiSpec as any, {
    customSiteTitle: 'Ohara API Docs',
    customCss: `
      .topbar-wrapper img { content: url('https://raw.githubusercontent.com/swagger-api/swagger-ui/master/src/img/logo_small.png'); width: 40px; height: 40px; }
      .topbar-wrapper .link { display: inline-flex; align-items: center; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application started successfully`);
  logger.log(`Server running on: http://localhost:${port}/v2`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error.stack);
  process.exit(1);
});

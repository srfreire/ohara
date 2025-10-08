import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();
  logger.log('CORS enabled');

  // Global prefix for all routes
  app.setGlobalPrefix('v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application started successfully`);
  logger.log(`📡 Server running on: http://localhost:${port}/v1`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error.stack);
  process.exit(1);
});

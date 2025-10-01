import { Module } from '@nestjs/common';
import { CollectionsController } from './controllers/collections.controller';
import { CollectionsService } from './services/collections.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}

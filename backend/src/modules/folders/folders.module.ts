import { Module } from '@nestjs/common';
import { FoldersController } from './controllers/folders.controller';
import { FoldersService } from './services/folders.service';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}

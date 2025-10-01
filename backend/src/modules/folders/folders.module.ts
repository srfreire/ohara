import { Module } from '@nestjs/common';
import { FoldersController } from './controllers/folders.controller';
import { FoldersService } from './services/folders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}

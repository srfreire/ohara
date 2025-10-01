import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { UsersModule } from './modules/users/users.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ItemsModule } from './modules/items/items.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FoldersModule } from './modules/folders/folders.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgentModule } from './modules/agent/agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    CollectionsModule,
    ItemsModule,
    DocumentsModule,
    FoldersModule,
    CommentsModule,
    ReactionsModule,
    AuthModule,
    AgentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}

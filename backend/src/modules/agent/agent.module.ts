import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config_service: ConfigService) => ({
        secret: config_service.get<string>('AGENT_SECRET_KEY'),
        signOptions: {
          expiresIn: config_service.get<string>('JWT_EXPIRES_IN') || '2h',
        },
      }),
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}

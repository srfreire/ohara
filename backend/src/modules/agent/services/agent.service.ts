import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Response } from 'express';

interface StreamRequestDto {
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  model?: string;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger('AgentService');

  constructor(
    private config_service: ConfigService,
    private jwt_service: JwtService,
  ) {}

  async stream_chat(
    stream_request: StreamRequestDto,
    user_id: string,
    user_email: string,
    res: Response,
  ): Promise<void> {
    try {
      // Get agent service URL from config
      const agent_service_url = this.config_service.get<string>('AGENT_SERVICE_URL');

      if (!agent_service_url) {
        throw new HttpException(
          'Agent service URL not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Check if agent service is reachable
      try {
        await axios.get(`${agent_service_url}/health`, { timeout: 2000 });
      } catch (error) {
        this.logger.error(`🔌 Agent service not reachable at ${agent_service_url}`);
        throw new HttpException(
          'Agent service is not running. Please start the AI service on port 8001.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Get agent JWT secret (must match agent's JWT_SECRET_KEY)
      const agent_jwt_secret = this.config_service.get<string>('AGENT_SECRET_KEY');

      if (!agent_jwt_secret) {
        throw new HttpException(
          'Agent JWT secret not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Create JWT token for agent service authentication
      // Note: Agent expects payload with 'sub' (email) and 'user_id' fields
      const agent_service_token = this.jwt_service.sign(
        {
          sub: user_email,  // Agent expects 'sub' field
          user_id: user_id,
          email: user_email,
        },
        {
          secret: agent_jwt_secret,
          expiresIn: '1h',
        }
      );

      this.logger.debug(`🎟️  Generated JWT for agent service (length: ${agent_service_token.length})`);

      // Set streaming response headers
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Prepare request for agent service
      const agent_request = {
        messages: stream_request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        model: stream_request.model || 'gpt-4.1',
      };

      this.logger.log(`🤖 Calling agent service - URL: ${agent_service_url}/v1/chat/stream, Messages: ${stream_request.messages.length}, User: ${user_email}`);

      // Call agent service for AI processing
      const agent_response = await axios.post(
        `${agent_service_url}/v1/chat/stream`,
        agent_request,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agent_service_token}`,
          },
          timeout: 300000, // 5 minute timeout for streaming
          responseType: 'stream',
        },
      );

      // Validate that we received a proper stream response
      if (!agent_response.data || typeof agent_response.data.on !== 'function') {
        this.logger.error('❌ Agent response is not a stream', agent_response.data);
        throw new HttpException(
          'Invalid response from agent service',
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.log('📡 Streaming response from agent service to client');

      // Stream response to client
      agent_response.data.on('data', (chunk: Buffer) => {
        res.write(chunk);
      });

      agent_response.data.on('end', () => {
        this.logger.log('✅ Chat stream completed successfully');
        res.end();
      });

      agent_response.data.on('error', (error: any) => {
        this.logger.error('❌ Agent stream error:', error);
        res.end();
      });

    } catch (error) {
      this.logger.error('❌ Chat stream error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          this.logger.error('⏱️  Agent service timeout');
          throw new HttpException('Agent service timeout', HttpStatus.GATEWAY_TIMEOUT);
        } else if (error.code === 'ECONNREFUSED') {
          this.logger.error('🔌 Agent service unavailable (connection refused)');
          throw new HttpException('Agent service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
          this.logger.error(`⚠️  Axios error: ${error.code} - Status: ${error.response?.status} ${error.response?.statusText}`);

          // Safely log response data (avoid circular references)
          try {
            const response_data = error.response?.data;
            if (response_data && typeof response_data === 'object') {
              this.logger.error(`Response: ${response_data.message || response_data.error || 'No message'}`);
            }
          } catch (e) {
            this.logger.error('Could not parse response data');
          }

          throw new HttpException(
            error.response?.data?.message || 'Agent service error',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // Log the full error before throwing generic error
      this.logger.error('❌ Unhandled error in chat stream:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
      });

      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

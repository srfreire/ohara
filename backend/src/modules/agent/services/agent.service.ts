import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

      // Create JWT token for agent service authentication
      const agent_service_token = this.jwt_service.sign({
        user_id: user_id,
        email: user_email,
      });

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

      console.log('🤖 Calling agent service:', {
        url: `${agent_service_url}/v1/chat/stream`,
        token_length: agent_service_token.length,
        message_count: stream_request.messages.length,
      });

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
        console.error('Agent response is not a stream:', agent_response.data);
        throw new HttpException(
          'Invalid response from agent service',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Stream response to client
      agent_response.data.on('data', (chunk: Buffer) => {
        res.write(chunk);
      });

      agent_response.data.on('end', () => {
        res.end();
      });

      agent_response.data.on('error', (error: any) => {
        console.error('Agent stream error:', error);
        res.end();
      });

    } catch (error) {
      console.error('Chat stream error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new HttpException('Agent service timeout', HttpStatus.GATEWAY_TIMEOUT);
        } else if (error.code === 'ECONNREFUSED') {
          throw new HttpException('Agent service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
          console.error('Axios error details:', {
            code: error.code,
            status: error.response?.status,
            status_text: error.response?.statusText,
            data: error.response?.data,
          });
          throw new HttpException(
            'Agent service error',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // Log the full error before throwing generic error
      console.error('Unhandled error in chat stream:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
      });

      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

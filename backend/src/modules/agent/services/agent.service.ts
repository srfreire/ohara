import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import axios from 'axios';
import { Response } from 'express';

const AGENT_HEALTH_CHECK_TIMEOUT_MS = 2000;
const AGENT_STREAM_TIMEOUT_MS = 300000;

interface StreamRequestDto {
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  model?: string;
  document_id?: string;
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
      const agent_service_url = this.config_service.get<string>('AGENT_SERVICE_URL');

      if (!agent_service_url) {
        throw new HttpException(
          'Agent service URL not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        await axios.get(`${agent_service_url}/health`, { timeout: AGENT_HEALTH_CHECK_TIMEOUT_MS });
      } catch (error) {
        this.logger.error(`Agent service not reachable at ${agent_service_url}`);
        throw new HttpException(
          'Agent service is not running. Please start the AI service on port 8001.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const agent_jwt_secret = this.config_service.get<string>('AGENT_SECRET_KEY');

      if (!agent_jwt_secret) {
        throw new HttpException(
          'Agent JWT secret not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const org_unit_id = this.config_service.get<string>('ORG_UNIT_ID');
      const org_unit_name = this.config_service.get<string>('ORG_UNIT_NAME');

      this.logger.debug(`ORG_UNIT_ID from env: ${org_unit_id}`);
      this.logger.debug(`ORG_UNIT_NAME from env: ${org_unit_name}`);

      let org_unit_context: {
        org_unit_id: string;
        org_unit_name: string;
        selected_folders?: string[];
      } | null = null;

      if (org_unit_id) {
        org_unit_context = {
          org_unit_id: org_unit_id,
          org_unit_name: org_unit_name || 'Default Organization',
          selected_folders: [],
        };
        this.logger.debug(`Created org_unit_context: ${JSON.stringify(org_unit_context)}`);
      } else {
        this.logger.error('ORG_UNIT_ID not found in environment variables!');
      }

      const agent_service_token = this.jwt_service.sign(
        {
          sub: user_email,
          user_id: user_id,
          email: user_email,
          org_unit: org_unit_id
            ? {
                org_unit_id: org_unit_id,
                org_unit_name: org_unit_name,
              }
            : null,
        },
        {
          secret: agent_jwt_secret,
          expiresIn: '1h',
        },
      );

      this.logger.debug(
        `Generated JWT for agent service (length: ${agent_service_token.length}, org_unit: ${org_unit_id})`,
      );

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const agent_request = {
        messages: stream_request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        model: stream_request.model || 'gpt-4.1',
        org_unit_context: org_unit_context,
      };

      this.logger.debug(`Sending to agent: ${JSON.stringify({ ...agent_request, messages: `${agent_request.messages.length} messages` })}`);


      this.logger.log(
        `Calling agent service - URL: ${agent_service_url}/v1/chat/stream, Messages: ${stream_request.messages.length}, User: ${user_email}`,
      );

      const agent_response = await axios.post(
        `${agent_service_url}/v1/chat/stream`,
        agent_request,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${agent_service_token}`,
          },
          timeout: AGENT_STREAM_TIMEOUT_MS,
          responseType: 'stream',
        },
      );

      if (!agent_response.data || typeof agent_response.data.on !== 'function') {
        this.logger.error('Agent response is not a stream', agent_response.data);
        throw new HttpException('Invalid response from agent service', HttpStatus.BAD_GATEWAY);
      }

      this.logger.log('Streaming response from agent service to client');

      agent_response.data.on('data', (chunk: Buffer) => {
        res.write(chunk);
      });

      agent_response.data.on('end', () => {
        this.logger.log('Chat stream completed successfully');
        res.end();
      });

      agent_response.data.on('error', (error: any) => {
        this.logger.error('Agent stream error:', error);
        res.end();
      });
    } catch (error) {
      this.logger.error('Chat stream error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          this.logger.error('Agent service timeout');
          throw new HttpException('Agent service timeout', HttpStatus.GATEWAY_TIMEOUT);
        } else if (error.code === 'ECONNREFUSED') {
          this.logger.error('Agent service unavailable (connection refused)');
          throw new HttpException('Agent service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
          this.logger.error(
            `Axios error: ${error.code} - Status: ${error.response?.status} ${error.response?.statusText}`,
          );

          try {
            const response_data = error.response?.data;
            if (response_data && typeof response_data === 'object') {
              this.logger.error(
                `Response: ${response_data.message || response_data.error || 'No message'}`,
              );
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

      this.logger.error('Unhandled error in chat stream:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
      });

      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

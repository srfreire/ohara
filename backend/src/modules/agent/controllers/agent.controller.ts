import { Controller, Post, Body, Res, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { Response } from 'express';
import { z } from 'zod';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentService } from '../services/agent.service';

// Zod schema for stream request validation
const stream_request_schema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
      timestamp: z.string().optional(),
    }),
  ),
  model: z.string().optional().default('gpt-4.1'),
  document_id: z.string().optional(),
});

type StreamRequestDto = z.infer<typeof stream_request_schema>;

@ApiTags('agent')
@ApiBearerAuth('JWT-auth')
@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  private readonly logger = new Logger('AgentController');

  constructor(private readonly agent_service: AgentService) {}

  @Post('stream')
  @ApiOperation({
    summary: 'Stream AI chat responses',
    description:
      'Send messages to the AI agent and receive streamed responses via Server-Sent Events (SSE). Supports document context.',
  })
  @ApiBody({
    description: 'Chat request with message history',
    schema: {
      example: {
        messages: [
          { role: 'user', content: 'Summarize this document', timestamp: '2025-01-10T12:00:00Z' },
        ],
        model: 'gpt-4.1',
        document_id: 'uuid-optional',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Streaming response started (text/event-stream)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Agent service unavailable' })
  async stream(
    @Body(new ZodValidationPipe(stream_request_schema)) stream_request: StreamRequestDto,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const user_id = req.user.id;
    const user_email = req.user.email;

    this.logger.log(
      `💬 Chat stream request - User: ${user_email}, Messages: ${stream_request.messages.length}, Model: ${stream_request.model}${stream_request.document_id ? `, Document: ${stream_request.document_id}` : ''}`,
    );

    await this.agent_service.stream_chat(stream_request, user_id, user_email, res);
  }
}

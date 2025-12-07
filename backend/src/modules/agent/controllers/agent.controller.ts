import { Controller, Post, Body, Res, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentService } from '../services/agent.service';
import { stream_request_schema, StreamRequestDto } from '../models/agent.model';
import { SkipTransform } from '../../../common/interceptors/transform.interceptor';

@ApiTags('agent')
@Controller('v2/agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  private readonly logger = new Logger('AgentController');

  constructor(private readonly agent_service: AgentService) {}

  @Post('stream')
  @SkipTransform()
  async stream(
    @Body(new ZodValidationPipe(stream_request_schema)) stream_request: StreamRequestDto,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const user_id = req.user.id;
    const user_email = req.user.email;

    this.logger.log(
      `Chat stream request - User: ${user_email}, Messages: ${stream_request.messages.length}, Model: ${stream_request.model}${stream_request.document_id ? `, Document: ${stream_request.document_id}` : ''}`,
    );

    await this.agent_service.stream_chat(stream_request, user_id, user_email, res);
  }
}

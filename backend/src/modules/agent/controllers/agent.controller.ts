import { Controller, Post, Body, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { z } from 'zod';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../../common/validation/zod-validation.pipe';
import { AgentService } from '../services/agent.service';

// Zod schema for stream request validation
const stream_request_schema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
    timestamp: z.string().optional(),
  })),
  model: z.string().optional().default('gpt-4.1'),
});

type StreamRequestDto = z.infer<typeof stream_request_schema>;

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agent_service: AgentService) {}

  @Post('stream')
  async stream(
    @Body(new ZodValidationPipe(stream_request_schema)) stream_request: StreamRequestDto,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const user_id = req.user.id;
    const user_email = req.user.email;

    await this.agent_service.stream_chat(stream_request, user_id, user_email, res);
  }
}

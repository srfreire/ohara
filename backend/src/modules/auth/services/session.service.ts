import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { get_redis_client } from '../../../lib/redis.client';

const SESSION_TTL = 2 * 60 * 60; // 2 hours in seconds

interface SessionData {
  user_id: string;
  email: string;
  created_at: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger('SessionService');
  private redis = get_redis_client();

  async create_session(user_id: string, email: string): Promise<string> {
    const session_id = uuidv4();
    const session_data: SessionData = {
      user_id,
      email,
      created_at: Date.now(),
    };

    await this.redis.set(
      `session:${session_id}`,
      JSON.stringify(session_data),
      'EX',
      SESSION_TTL,
    );

    // Track session by user for "logout all" functionality
    await this.redis.sadd(`user_sessions:${user_id}`, session_id);

    this.logger.log(`Session created for user ${email}: ${session_id}`);

    return session_id;
  }

  async validate_session(session_id: string): Promise<SessionData | null> {
    const data = await this.redis.get(`session:${session_id}`);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SessionData;
  }

  async delete_session(session_id: string): Promise<void> {
    const data = await this.redis.get(`session:${session_id}`);

    if (data) {
      const session = JSON.parse(data) as SessionData;
      await this.redis.srem(`user_sessions:${session.user_id}`, session_id);
    }

    await this.redis.del(`session:${session_id}`);

    this.logger.log(`Session deleted: ${session_id}`);
  }

  async delete_all_user_sessions(user_id: string): Promise<void> {
    const session_ids = await this.redis.smembers(`user_sessions:${user_id}`);

    if (session_ids.length > 0) {
      const keys = session_ids.map((id: string) => `session:${id}`);
      await this.redis.del(...keys);
    }

    await this.redis.del(`user_sessions:${user_id}`);

    this.logger.log(`All sessions deleted for user: ${user_id}`);
  }
}

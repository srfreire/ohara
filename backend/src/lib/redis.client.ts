import Redis from 'ioredis';

let redis_instance: Redis | null = null;

export function get_redis_client(): Redis {
  if (redis_instance) {
    return redis_instance;
  }

  const redis_url = process.env.REDIS_URL;

  if (!redis_url) {
    throw new Error(
      'Missing Redis environment variable. Please set REDIS_URL in your .env file.',
    );
  }

  redis_instance = new Redis(redis_url);

  return redis_instance;
}

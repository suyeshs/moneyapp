// lib/redis.ts
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
    throw new Error('The REDIS_URL environment variable is not set.');
  }
  

const client = new Redis(process.env.REDIS_URL);

export async function setCache(key: string, data: any): Promise<void> {
  await client.set(key, JSON.stringify(data));
}

export async function getCache(key: string): Promise<any | null> {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

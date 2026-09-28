import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  constructor() {
    try {
      this.redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't crash if redis is offline
      });

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully for caching team search queries');
      });

      this.redisClient.on('error', () => {
        // Silently fallback to memory cache if Redis server is unavailable
        this.redisClient = null;
      });
    } catch {
      this.redisClient = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch {
        // Fallback to in-memory
      }
    }

    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch {
        // Fallback to in-memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async delPattern(patternPrefix: string): Promise<void> {
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${patternPrefix}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch {
        // Fallback
      }
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cache = new CacheService();

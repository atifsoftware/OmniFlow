import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * OmniFlow Multi-Tier Cache Service
 * Tier 1: Ultra-fast local In-Memory store (zero network latency)
 * Tier 2: Distributed Redis cache (shared across instances and persistent)
 *
 * Gracefully falls back to Tier 1 if Redis is unavailable or unconfigured.
 */
@Injectable()
export class OmniCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OmniCacheService.name);
  private store = new Map<string, CacheEntry<any>>();
  private redisClient: Redis | null = null;
  private isRedisConnected = false;

  onModuleInit() {
    this.initRedis();
  }

  private initRedis() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD || undefined;
    const redisUrl = process.env.REDIS_URL;

    try {
      if (redisUrl) {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          enableOfflineQueue: false,
          retryStrategy: (times) => (times > 2 ? null : 1000),
        });
      } else {
        this.redisClient = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          enableOfflineQueue: false,
          retryStrategy: (times) => (times > 2 ? null : 1000),
        });
      }

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        this.logger.log(`🚀 Distributed Redis cache connected at ${redisHost}:${redisPort}`);
      });

      this.redisClient.on('error', (err) => {
        if (this.isRedisConnected) {
          this.logger.warn(`⚠️ Redis disconnected (${err.message}). Using in-memory fallback.`);
        }
        this.isRedisConnected = false;
      });

      this.redisClient.on('close', () => {
        this.isRedisConnected = false;
      });
    } catch (err: any) {
      this.logger.warn(`⚠️ Redis initialization failed: ${err.message}. Operating with local in-memory cache.`);
      this.isRedisConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        this.redisClient.disconnect();
      }
    }
  }

  /**
   * Set cache entry (updates L1 in-memory immediately, synchronizes with Redis L2)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });

    if (this.isRedisConnected && this.redisClient) {
      try {
        const serialized = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
      } catch (err: any) {
        this.logger.debug(`Redis SET error for key "${key}": ${err.message}`);
      }
    }
  }

  /**
   * Synchronous L1 in-memory cache reader
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Asynchronous multi-tier cache reader (checks L1 memory, then Redis L2)
   */
  async getAsync<T>(key: string): Promise<T | null> {
    // 1. Check local L1 memory cache
    const local = this.get<T>(key);
    if (local !== null) {
      return local;
    }

    // 2. Check distributed Redis L2 cache
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          // Hydrate local L1 cache with 60s default TTL
          this.store.set(key, { value: parsed, expiresAt: Date.now() + 60000 });
          return parsed;
        }
      } catch (err: any) {
        this.logger.debug(`Redis GET error for key "${key}": ${err.message}`);
      }
    }

    return null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  async hasAsync(key: string): Promise<boolean> {
    return (await this.getAsync(key)) !== null;
  }

  async del(key: string): Promise<boolean> {
    const deletedLocally = this.store.delete(key);

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.debug(`Redis DEL error for key "${key}": ${err.message}`);
      }
    }

    return deletedLocally;
  }

  /**
   * Delete keys matching a wildcard pattern (e.g. 'products:*') across L1 and Redis L2
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }

    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err: any) {
        this.logger.debug(`Redis deleteByPattern error for "${pattern}": ${err.message}`);
      }
    }
  }

  async clear(): Promise<void> {
    this.store.clear();

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err: any) {
        this.logger.debug(`Redis FLUSHDB error: ${err.message}`);
      }
    }

    this.logger.log('🧹 Multi-tier cache cleared.');
  }

  /**
   * Remember pattern: checks cache, or runs fetcher callback, stores and returns result.
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.getAsync<T>(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetcher();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }

  /**
   * Check if Redis backend is currently connected
   */
  isRedisActive(): boolean {
    return this.isRedisConnected;
  }
}

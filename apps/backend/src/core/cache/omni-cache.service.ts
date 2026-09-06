import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

@Injectable()
export class OmniCacheService {
  private readonly logger = new Logger(OmniCacheService.name);
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  del(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.logger.log('🧹 Application cache cleared.');
  }

  /**
   * Remember pattern (just like NodeFlow Cache.remember)
   * Fetches from cache, or executes the fetcher callback, stores it, and returns it.
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetcher();
    this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}

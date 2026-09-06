import { OmniCacheService } from './omni-cache.service';

describe('OmniCacheService', () => {
  let cacheService: OmniCacheService;

  beforeEach(() => {
    cacheService = new OmniCacheService();
    // Do not call initRedis so it operates cleanly in-memory during unit tests
  });

  afterEach(async () => {
    await cacheService.clear();
  });

  it('should store and retrieve a value', async () => {
    await cacheService.set('test_key', { role: 'admin' });
    const val = cacheService.get<{ role: string }>('test_key');
    expect(val).toEqual({ role: 'admin' });
  });

  it('should return null for non-existent key', () => {
    const val = cacheService.get('non_existent');
    expect(val).toBeNull();
  });

  it('should delete key properly', async () => {
    await cacheService.set('key_to_del', 'value');
    expect(cacheService.has('key_to_del')).toBe(true);

    await cacheService.del('key_to_del');
    expect(cacheService.has('key_to_del')).toBe(false);
  });

  it('should support the remember pattern', async () => {
    const fetcher = jest.fn().mockResolvedValue({ id: 101, name: 'Sample Item' });

    // First call: executes fetcher
    const first = await cacheService.remember('item:101', 60, fetcher);
    expect(first).toEqual({ id: 101, name: 'Sample Item' });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call: serves from cache, fetcher is NOT called again
    const second = await cacheService.remember('item:101', 60, fetcher);
    expect(second).toEqual({ id: 101, name: 'Sample Item' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

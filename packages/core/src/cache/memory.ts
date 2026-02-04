import type { CacheBackend, CacheOptions, CacheStats } from './types.js';

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  lastAccessed: number;
}

const DEFAULT_MAX_SIZE = 1000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export class MemoryCache<V = unknown> implements CacheBackend<V> {
  private store = new Map<string, CacheEntry<V>>();
  private maxSize: number;
  private ttlMs: number;
  private hitCount = 0;
  private missCount = 0;

  constructor(options?: CacheOptions) {
    this.maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
    this.ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return undefined;
    }

    entry.lastAccessed = Date.now();
    this.hitCount++;
    return entry.value;
  }

  set(key: string, value: V): void {
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evictLRU();
    }

    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + this.ttlMs,
      lastAccessed: now,
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  stats(): CacheStats {
    const total = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      size: this.store.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hitCount / total : 0,
    };
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }
}

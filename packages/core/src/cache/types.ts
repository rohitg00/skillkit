export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export interface CacheOptions {
  maxSize?: number;
  ttlMs?: number;
}

export interface CacheBackend<V = unknown> {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): boolean;
  has(key: string): boolean;
  clear(): void;
  stats(): CacheStats;
}

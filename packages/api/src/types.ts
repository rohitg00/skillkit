export interface ApiSkill {
  name: string;
  description?: string;
  source: string;
  repo?: string;
  tags?: string[];
  category?: string;
  content?: string;
  stars?: number;
  installs?: number;
}

export interface SearchResponse {
  skills: ApiSkill[];
  total: number;
  query: string;
  limit: number;
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  skillCount: number;
  uptime: number;
}

export interface CacheStatsResponse {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export interface TrendingResponse {
  skills: ApiSkill[];
  limit: number;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryCount[];
  total: number;
}

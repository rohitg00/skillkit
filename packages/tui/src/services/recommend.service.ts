export interface RecommendationDisplay {
  name: string;
  description: string;
  score: number;
  reasons: string[];
  source: string;
  tags: string[];
  installCommand?: string;
}

export interface RecommendationOptions {
  limit?: number;
  minScore?: number;
  categories?: string[];
  refresh?: boolean;
}

export interface RecommendServiceState {
  recommendations: RecommendationDisplay[];
  analyzing: boolean;
  loading: boolean;
  error: string | null;
  lastAnalyzed?: string;
}

export async function getRecommendations(
  _projectPath?: string,
  _options?: RecommendationOptions
): Promise<RecommendServiceState> {
  return {
    recommendations: [],
    analyzing: false,
    loading: false,
    error: null,
    lastAnalyzed: new Date().toISOString(),
  };
}

export async function analyzeProject(_projectPath?: string): Promise<{
  languages: string[];
  frameworks: string[];
  libraries: string[];
  patterns: string[];
} | null> {
  return {
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['Solid.js'],
    libraries: ['@opentui/solid'],
    patterns: [],
  };
}

export async function refreshRecommendations(
  projectPath?: string
): Promise<RecommendServiceState> {
  return getRecommendations(projectPath, { refresh: true });
}

export async function getRecommendationsByCategory(
  _category: string,
  projectPath?: string
): Promise<RecommendationDisplay[]> {
  const result = await getRecommendations(projectPath);
  return result.recommendations;
}

export const recommendService = {
  getRecommendations,
  analyzeProject,
  refreshRecommendations,
  getRecommendationsByCategory,
};

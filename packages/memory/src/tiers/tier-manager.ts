import type { MemoryStore } from '../stores/memory-store.js';
import type {
  PersistentMemory,
  TierPromotionConfig,
  MemoryTier,
} from '../types.js';
import { DEFAULT_TIER_PROMOTION_CONFIG } from '../types.js';

export interface TierEvaluationResult {
  memoryId: string;
  currentTier: MemoryTier;
  suggestedTier: MemoryTier;
  reason: string;
  score: number;
}

export class TierManager {
  private config: TierPromotionConfig;

  constructor(config: Partial<TierPromotionConfig> = {}) {
    this.config = { ...DEFAULT_TIER_PROMOTION_CONFIG, ...config };
  }

  evaluateForPromotion(memory: PersistentMemory): TierEvaluationResult {
    const score = this.calculatePromotionScore(memory);
    const threshold = 0.7;

    const shouldPromote = memory.tier === 'warm' && score >= threshold;
    const shouldDemote = memory.tier === 'long' && score < 0.3;

    let suggestedTier = memory.tier;
    let reason = 'Memory is appropriately tiered';

    if (shouldPromote) {
      suggestedTier = 'long';
      reason = this.getPromotionReason(memory);
    } else if (shouldDemote) {
      suggestedTier = 'warm';
      reason = this.getDemotionReason(memory);
    }

    return {
      memoryId: memory.id,
      currentTier: memory.tier,
      suggestedTier,
      reason,
      score,
    };
  }

  calculatePromotionScore(memory: PersistentMemory): number {
    const accessScore = Math.min(1, memory.accessCount / this.config.accessCountThreshold);

    const reinforcementScore = memory.reinforcementScore / this.config.reinforcementScoreThreshold;

    const ageMs = Date.now() - new Date(memory.createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const ageScore = Math.min(1, ageDays / this.config.ageThresholdDays);

    const recencyMs = Date.now() - new Date(memory.lastAccessedAt).getTime();
    const recencyDays = recencyMs / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - recencyDays / 30);

    const weights = {
      access: 0.3,
      reinforcement: 0.35,
      age: 0.15,
      recency: 0.2,
    };

    return (
      accessScore * weights.access +
      Math.min(1, reinforcementScore) * weights.reinforcement +
      ageScore * weights.age +
      recencyScore * weights.recency
    );
  }

  async evaluateAll(store: MemoryStore, agentId: string): Promise<TierEvaluationResult[]> {
    const memories = await store.list(agentId);
    return memories.map(memory => this.evaluateForPromotion(memory));
  }

  async applyRecommendations(
    store: MemoryStore,
    evaluations: TierEvaluationResult[]
  ): Promise<{ promoted: string[]; demoted: string[] }> {
    const promoted: string[] = [];
    const demoted: string[] = [];

    for (const evaluation of evaluations) {
      if (evaluation.currentTier === evaluation.suggestedTier) continue;

      if (evaluation.suggestedTier === 'long') {
        await store.promoteToLongTerm(evaluation.memoryId);
        promoted.push(evaluation.memoryId);
      } else {
        await store.demoteToWarm(evaluation.memoryId);
        demoted.push(evaluation.memoryId);
      }
    }

    return { promoted, demoted };
  }

  async autoPromote(
    store: MemoryStore,
    agentId: string
  ): Promise<{ promoted: string[]; demoted: string[] }> {
    const evaluations = await this.evaluateAll(store, agentId);
    return this.applyRecommendations(store, evaluations);
  }

  getConfig(): TierPromotionConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<TierPromotionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  private getPromotionReason(memory: PersistentMemory): string {
    const reasons: string[] = [];

    if (memory.accessCount >= this.config.accessCountThreshold) {
      reasons.push(`accessed ${memory.accessCount} times`);
    }

    if (memory.reinforcementScore >= this.config.reinforcementScoreThreshold) {
      reasons.push(`high reinforcement (${memory.reinforcementScore.toFixed(2)})`);
    }

    const ageDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays >= this.config.ageThresholdDays) {
      reasons.push(`${Math.floor(ageDays)} days old`);
    }

    return reasons.length > 0
      ? `Promote to long-term: ${reasons.join(', ')}`
      : 'Memory qualifies for long-term storage';
  }

  private getDemotionReason(memory: PersistentMemory): string {
    const reasons: string[] = [];

    if (memory.reinforcementScore < 0.3) {
      reasons.push(`low reinforcement (${memory.reinforcementScore.toFixed(2)})`);
    }

    const recencyDays =
      (Date.now() - new Date(memory.lastAccessedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (recencyDays > 30) {
      reasons.push(`not accessed in ${Math.floor(recencyDays)} days`);
    }

    return reasons.length > 0
      ? `Demote to warm: ${reasons.join(', ')}`
      : 'Memory no longer qualifies for long-term storage';
  }
}

export function createTierManager(config?: Partial<TierPromotionConfig>): TierManager {
  return new TierManager(config);
}

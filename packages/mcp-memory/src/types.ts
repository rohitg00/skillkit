import { z } from 'zod';

export const MemoryCategorySchema = z.enum([
  'fact',
  'decision',
  'preference',
  'pattern',
  'insight',
  'reasoning',
]);

export const MemoryTierSchema = z.enum(['warm', 'long']);

export const RelationshipTypeSchema = z.enum([
  'related',
  'derived',
  'contradicts',
  'supports',
]);

export const StoreMemoryInputSchema = z.object({
  content: z.string().describe('The memory content to store'),
  category: MemoryCategorySchema.describe('Category of the memory'),
  tags: z.array(z.string()).optional().describe('Optional tags for organization'),
  metadata: z.record(z.unknown()).optional().describe('Optional metadata'),
});

export const SearchMemoryInputSchema = z.object({
  query: z.string().describe('Semantic search query'),
  category: MemoryCategorySchema.optional().describe('Filter by category'),
  tier: MemoryTierSchema.optional().describe('Filter by tier (warm or long)'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum results to return'),
  threshold: z.number().min(0).max(1).default(0.5).describe('Minimum similarity threshold'),
});

export const RecallMemoryInputSchema = z.object({
  category: MemoryCategorySchema.optional().describe('Filter by category'),
  tier: MemoryTierSchema.optional().describe('Filter by tier'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum results'),
});

export const ForgetMemoryInputSchema = z.object({
  id: z.string().describe('Memory ID to delete'),
});

export const LinkMemoriesInputSchema = z.object({
  sourceId: z.string().describe('Source memory ID'),
  targetId: z.string().describe('Target memory ID'),
  relationshipType: RelationshipTypeSchema.describe('Type of relationship'),
  strength: z.number().min(0).max(1).default(0.5).describe('Relationship strength'),
});

export const GetMemoryInputSchema = z.object({
  id: z.string().describe('Memory ID to retrieve'),
});

export const ReinforceMemoryInputSchema = z.object({
  id: z.string().describe('Memory ID to reinforce'),
  amount: z.number().min(-1).max(1).default(0.1).describe('Reinforcement amount (-1 to 1)'),
});

export type StoreMemoryInput = z.infer<typeof StoreMemoryInputSchema>;
export type SearchMemoryInput = z.infer<typeof SearchMemoryInputSchema>;
export type RecallMemoryInput = z.infer<typeof RecallMemoryInputSchema>;
export type ForgetMemoryInput = z.infer<typeof ForgetMemoryInputSchema>;
export type LinkMemoriesInput = z.infer<typeof LinkMemoriesInputSchema>;
export type GetMemoryInput = z.infer<typeof GetMemoryInputSchema>;
export type ReinforceMemoryInput = z.infer<typeof ReinforceMemoryInputSchema>;

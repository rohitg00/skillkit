import { z } from 'zod';

export const SearchSkillsInputSchema = z.object({
  query: z.string().describe('Search query for skills'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum results'),
  include_content: z.boolean().default(false).describe('Include full skill content'),
  include_references: z.boolean().default(false).describe('Include reference file paths'),
  filters: z
    .object({
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      source: z.string().optional(),
    })
    .optional()
    .describe('Optional filters'),
});

export const GetSkillInputSchema = z.object({
  source: z.string().describe('Skill source (e.g. owner/repo)'),
  skill_id: z.string().describe('Skill name/identifier'),
  include_references: z.boolean().default(false).describe('Include reference file paths'),
});

export const RecommendSkillsInputSchema = z.object({
  languages: z.array(z.string()).optional().describe('Programming languages'),
  frameworks: z.array(z.string()).optional().describe('Frameworks in use'),
  libraries: z.array(z.string()).optional().describe('Libraries in use'),
  task: z.string().optional().describe('Current task description'),
  limit: z.number().min(1).max(20).default(5).describe('Maximum results'),
});

export const ListCategoriesInputSchema = z.object({});

export type SearchSkillsInput = z.infer<typeof SearchSkillsInputSchema>;
export type GetSkillInput = z.infer<typeof GetSkillInputSchema>;
export type RecommendSkillsInput = z.infer<typeof RecommendSkillsInputSchema>;

import { z } from 'zod';

const BaseTreeNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  skills: z.array(z.string()).default([]),
  skillCount: z.number().default(0),
  depth: z.number().default(0),
});

export interface TreeNode {
  id: string;
  name: string;
  description?: string;
  children: TreeNode[];
  skills: string[];
  skillCount: number;
  depth: number;
}

export const TreeNodeSchema: z.ZodType<TreeNode> = BaseTreeNodeSchema.extend({
  children: z.lazy(() => z.array(TreeNodeSchema)).default([]),
}) as z.ZodType<TreeNode>;

export const SkillTreeSchema = z.object({
  version: z.number().default(1),
  generatedAt: z.string(),
  rootNode: TreeNodeSchema,
  totalSkills: z.number(),
  totalCategories: z.number(),
  maxDepth: z.number(),
});

export type SkillTree = z.infer<typeof SkillTreeSchema>;

export interface TreePath {
  segments: string[];
  node: TreeNode;
}

export interface CategoryMapping {
  category: string;
  subcategories: string[];
  tags: string[];
  keywords: string[];
}

export const CATEGORY_TAXONOMY: CategoryMapping[] = [
  {
    category: 'Development',
    subcategories: ['Frontend', 'Backend', 'Mobile', 'Desktop', 'Full-Stack'],
    tags: ['development', 'coding', 'programming', 'software'],
    keywords: ['build', 'create', 'develop', 'code', 'implement'],
  },
  {
    category: 'Frontend',
    subcategories: ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Astro', 'Next.js', 'Nuxt', 'Remix'],
    tags: ['frontend', 'ui', 'ux', 'web', 'client', 'browser', 'react', 'vue', 'angular', 'svelte', 'solid', 'astro', 'nextjs', 'nuxt', 'remix'],
    keywords: ['component', 'ui', 'interface', 'layout', 'style', 'css', 'html'],
  },
  {
    category: 'Backend',
    subcategories: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#', 'Express', 'FastAPI', 'Django', 'Flask'],
    tags: ['backend', 'server', 'api', 'node', 'nodejs', 'python', 'go', 'rust', 'java', 'express', 'fastapi', 'django', 'flask', 'fastify', 'koa', 'hono', 'nestjs'],
    keywords: ['server', 'api', 'endpoint', 'route', 'handler', 'middleware'],
  },
  {
    category: 'Mobile',
    subcategories: ['React Native', 'Flutter', 'iOS', 'Android', 'Expo'],
    tags: ['mobile', 'ios', 'android', 'react-native', 'flutter', 'expo', 'native'],
    keywords: ['app', 'mobile', 'phone', 'tablet', 'native'],
  },
  {
    category: 'DevOps',
    subcategories: ['CI/CD', 'Kubernetes', 'Docker', 'Cloud', 'Infrastructure'],
    tags: ['devops', 'ci', 'cd', 'cicd', 'kubernetes', 'k8s', 'docker', 'container', 'aws', 'gcp', 'azure', 'cloud', 'infrastructure', 'iac'],
    keywords: ['deploy', 'pipeline', 'container', 'orchestration', 'infra'],
  },
  {
    category: 'Testing',
    subcategories: ['Unit Testing', 'E2E Testing', 'Integration Testing', 'TDD'],
    tags: ['testing', 'test', 'unit', 'e2e', 'integration', 'jest', 'vitest', 'playwright', 'cypress', 'tdd'],
    keywords: ['test', 'spec', 'assertion', 'mock', 'coverage'],
  },
  {
    category: 'Security',
    subcategories: ['Authentication', 'Authorization', 'Encryption', 'Audit'],
    tags: ['security', 'auth', 'authentication', 'authorization', 'oauth', 'jwt', 'encryption', 'audit', 'vulnerability'],
    keywords: ['secure', 'protect', 'encrypt', 'authenticate', 'authorize'],
  },
  {
    category: 'AI/ML',
    subcategories: ['LLM Integration', 'Agents', 'RAG', 'Training', 'Inference'],
    tags: ['ai', 'ml', 'llm', 'openai', 'anthropic', 'gpt', 'claude', 'agent', 'rag', 'embedding', 'vector', 'training', 'inference'],
    keywords: ['ai', 'model', 'predict', 'generate', 'embed', 'chat'],
  },
  {
    category: 'Database',
    subcategories: ['SQL', 'NoSQL', 'ORM', 'Migrations'],
    tags: ['database', 'db', 'sql', 'nosql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase', 'prisma', 'drizzle'],
    keywords: ['query', 'schema', 'migration', 'model', 'record'],
  },
  {
    category: 'Tooling',
    subcategories: ['Linting', 'Formatting', 'Building', 'Bundling'],
    tags: ['tooling', 'tool', 'eslint', 'prettier', 'biome', 'webpack', 'vite', 'rollup', 'turbo', 'turborepo', 'monorepo'],
    keywords: ['lint', 'format', 'build', 'bundle', 'compile'],
  },
  {
    category: 'Documentation',
    subcategories: ['API Docs', 'Guides', 'READMEs', 'Comments'],
    tags: ['documentation', 'docs', 'readme', 'api-docs', 'jsdoc', 'typedoc', 'storybook'],
    keywords: ['doc', 'document', 'guide', 'readme', 'comment'],
  },
  {
    category: 'Performance',
    subcategories: ['Optimization', 'Caching', 'Profiling', 'Monitoring'],
    tags: ['performance', 'optimization', 'cache', 'caching', 'profiling', 'monitoring', 'metrics', 'observability'],
    keywords: ['optimize', 'fast', 'cache', 'profile', 'monitor'],
  },
];

export const TAG_TO_CATEGORY: Record<string, string[]> = {};

for (const mapping of CATEGORY_TAXONOMY) {
  for (const tag of mapping.tags) {
    if (!TAG_TO_CATEGORY[tag]) {
      TAG_TO_CATEGORY[tag] = [];
    }
    TAG_TO_CATEGORY[tag].push(mapping.category);
    for (const subcategory of mapping.subcategories) {
      TAG_TO_CATEGORY[tag].push(`${mapping.category} > ${subcategory}`);
    }
  }
}

export interface TreeGeneratorOptions {
  maxDepth?: number;
  minSkillsPerNode?: number;
  includeEmpty?: boolean;
}

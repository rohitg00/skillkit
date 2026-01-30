import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createMemoryStore, type MemoryStore } from '@skillkit/memory';
import {
  StoreMemoryInputSchema,
  SearchMemoryInputSchema,
  RecallMemoryInputSchema,
  ForgetMemoryInputSchema,
  LinkMemoriesInputSchema,
  GetMemoryInputSchema,
  ReinforceMemoryInputSchema,
} from './types.js';

const AGENT_ID = process.env.SKILLKIT_AGENT_ID || 'mcp-memory-server';
const DB_PATH = process.env.SKILLKIT_MEMORY_DB_PATH;

let memoryStore: MemoryStore | null = null;

async function getMemoryStore(): Promise<MemoryStore> {
  if (!memoryStore) {
    memoryStore = await createMemoryStore(AGENT_ID, DB_PATH);
  }
  return memoryStore;
}

const server = new Server(
  {
    name: 'skillkit-memory-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'memory_store',
        description: 'Store a new memory with semantic embedding for later retrieval. Memories are categorized and can be tagged for organization.',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'The memory content to store' },
            category: {
              type: 'string',
              enum: ['fact', 'decision', 'preference', 'pattern', 'insight', 'reasoning'],
              description: 'Category of the memory',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional tags for organization',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata',
            },
          },
          required: ['content', 'category'],
        },
      },
      {
        name: 'memory_search',
        description: 'Semantic search through stored memories. Returns memories most similar to the query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Semantic search query' },
            category: {
              type: 'string',
              enum: ['fact', 'decision', 'preference', 'pattern', 'insight', 'reasoning'],
              description: 'Filter by category',
            },
            tier: {
              type: 'string',
              enum: ['warm', 'long'],
              description: 'Filter by tier',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 50,
              default: 10,
              description: 'Maximum results',
            },
            threshold: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              default: 0.5,
              description: 'Minimum similarity threshold',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'memory_recall',
        description: 'Recall memories by category, tier, or tags without semantic search.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['fact', 'decision', 'preference', 'pattern', 'insight', 'reasoning'],
              description: 'Filter by category',
            },
            tier: {
              type: 'string',
              enum: ['warm', 'long'],
              description: 'Filter by tier',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: 'Maximum results',
            },
          },
        },
      },
      {
        name: 'memory_get',
        description: 'Get a specific memory by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Memory ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'memory_forget',
        description: 'Delete a memory by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Memory ID to delete' },
          },
          required: ['id'],
        },
      },
      {
        name: 'memory_link',
        description: 'Create a relationship link between two memories.',
        inputSchema: {
          type: 'object',
          properties: {
            sourceId: { type: 'string', description: 'Source memory ID' },
            targetId: { type: 'string', description: 'Target memory ID' },
            relationshipType: {
              type: 'string',
              enum: ['related', 'derived', 'contradicts', 'supports'],
              description: 'Type of relationship',
            },
            strength: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              default: 0.5,
              description: 'Relationship strength',
            },
          },
          required: ['sourceId', 'targetId', 'relationshipType'],
        },
      },
      {
        name: 'memory_reinforce',
        description: 'Reinforce or weaken a memory. Positive values strengthen, negative weaken. Strong memories get promoted to long-term tier.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Memory ID' },
            amount: {
              type: 'number',
              minimum: -1,
              maximum: 1,
              default: 0.1,
              description: 'Reinforcement amount',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'memory_stats',
        description: 'Get statistics about stored memories.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const store = await getMemoryStore();

  try {
    switch (name) {
      case 'memory_store': {
        const input = StoreMemoryInputSchema.parse(args);
        const memory = await store.create({
          agentId: AGENT_ID,
          content: input.content,
          category: input.category,
          tags: input.tags,
          metadata: input.metadata,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Memory stored successfully.\n\nID: ${memory.id}\nCategory: ${memory.category}\nTier: ${memory.tier}\nTags: ${memory.tags.join(', ') || 'none'}`,
            },
          ],
        };
      }

      case 'memory_search': {
        const input = SearchMemoryInputSchema.parse(args);
        const results = await store.semanticSearch(input.query, {
          agentId: AGENT_ID,
          category: input.category,
          tier: input.tier,
          tags: input.tags,
          limit: input.limit,
          threshold: input.threshold,
        });

        if (results.length === 0) {
          return {
            content: [{ type: 'text', text: 'No memories found matching your query.' }],
          };
        }

        const formatted = results
          .map(
            (r, i) =>
              `${i + 1}. [${r.memory.category}] (score: ${r.score.toFixed(3)})\n   ID: ${r.memory.id}\n   ${r.memory.content}\n   Tags: ${r.memory.tags.join(', ') || 'none'}`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${results.length} memories:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'memory_recall': {
        const input = RecallMemoryInputSchema.parse(args);
        let memories = await store.list(AGENT_ID, input.limit ?? 20);

        if (input.category) {
          memories = memories.filter(m => m.category === input.category);
        }
        if (input.tier) {
          memories = memories.filter(m => m.tier === input.tier);
        }
        if (input.tags && input.tags.length > 0) {
          memories = memories.filter(m =>
            input.tags!.some(tag => m.tags.includes(tag))
          );
        }

        if (memories.length === 0) {
          return {
            content: [{ type: 'text', text: 'No memories found with the specified filters.' }],
          };
        }

        const formatted = memories
          .map(
            (m, i) =>
              `${i + 1}. [${m.category}] (${m.tier})\n   ID: ${m.id}\n   ${m.content}\n   Score: ${m.reinforcementScore.toFixed(2)} | Access: ${m.accessCount}`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Recalled ${memories.length} memories:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'memory_get': {
        const input = GetMemoryInputSchema.parse(args);
        const memory = await store.get(input.id);

        if (!memory) {
          return {
            content: [{ type: 'text', text: `Memory not found: ${input.id}` }],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Memory Details:\n\nID: ${memory.id}\nCategory: ${memory.category}\nTier: ${memory.tier}\nContent: ${memory.content}\nTags: ${memory.tags.join(', ') || 'none'}\nReinforcement: ${memory.reinforcementScore.toFixed(2)}\nAccess Count: ${memory.accessCount}\nCreated: ${memory.createdAt}\nLast Accessed: ${memory.lastAccessedAt}`,
            },
          ],
        };
      }

      case 'memory_forget': {
        const input = ForgetMemoryInputSchema.parse(args);
        const existing = await store.get(input.id);

        if (!existing) {
          return {
            content: [{ type: 'text', text: `Memory not found: ${input.id}` }],
            isError: true,
          };
        }

        await store.delete(input.id);

        return {
          content: [{ type: 'text', text: `Memory deleted: ${input.id}` }],
        };
      }

      case 'memory_link': {
        const input = LinkMemoriesInputSchema.parse(args);
        const link = await store.link(
          input.sourceId,
          input.targetId,
          input.relationshipType,
          input.strength
        );

        return {
          content: [
            {
              type: 'text',
              text: `Link created:\n\nID: ${link.id}\n${input.sourceId} --[${input.relationshipType}]--> ${input.targetId}\nStrength: ${link.strength}`,
            },
          ],
        };
      }

      case 'memory_reinforce': {
        const input = ReinforceMemoryInputSchema.parse(args);
        try {
          const memory = await store.reinforce(input.id, input.amount ?? 0.1);
          return {
            content: [
              {
                type: 'text',
                text: `Memory reinforced:\n\nID: ${memory.id}\nNew Score: ${memory.reinforcementScore.toFixed(2)}\nTier: ${memory.tier}`,
              },
            ],
          };
        } catch {
          return {
            content: [{ type: 'text', text: `Memory not found: ${input.id}` }],
            isError: true,
          };
        }
      }

      case 'memory_stats': {
        const stats = await store.getStats(AGENT_ID);

        const categoryBreakdown = Object.entries(stats.byCategory)
          .map(([cat, count]) => `  ${cat}: ${count}`)
          .join('\n');

        const tierBreakdown = Object.entries(stats.byTier)
          .map(([tier, count]) => `  ${tier}: ${count}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Memory Statistics:\n\nTotal Memories: ${stats.totalMemories}\nAverage Reinforcement: ${stats.avgReinforcementScore.toFixed(2)}\n\nBy Category:\n${categoryBreakdown}\n\nBy Tier:\n${tierBreakdown}\n\nOldest: ${stats.oldestMemory || 'N/A'}\nNewest: ${stats.newestMemory || 'N/A'}`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'memory://stats',
        name: 'Memory Statistics',
        description: 'Current memory store statistics',
        mimeType: 'application/json',
      },
      {
        uri: 'memory://recent',
        name: 'Recent Memories',
        description: 'Most recently accessed memories',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const store = await getMemoryStore();

  if (uri === 'memory://stats') {
    const stats = await store.getStats(AGENT_ID);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  if (uri === 'memory://recent') {
    const memories = await store.list(AGENT_ID, 10);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(memories, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SkillKit Memory MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { server };

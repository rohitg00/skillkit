import type { CozoDb } from 'cozo-node';

export const MEMORY_SCHEMA = `
:create memories {
  id: String
  =>
  agent_id: String,
  category: String,
  tier: String,
  content: String,
  reinforcement_score: Float,
  created_at: String,
  updated_at: String,
  access_count: Int,
  last_accessed_at: String,
  tags: [String],
  metadata: String
}

:create memory_vec {
  id: String
  =>
  embedding: <F32; 384>
}

:create memory_links {
  id: String
  =>
  source_id: String,
  target_id: String,
  relationship_type: String,
  strength: Float,
  created_at: String
}

::hnsw create memory_vec:embedding_idx {
  dim: 384,
  m: 16,
  ef_construction: 100,
  dtype: F32,
  fields: [embedding],
  distance: Cosine,
  filter: null
}
`;

export const CREATE_MEMORIES_TABLE = `
:create memories {
  id: String
  =>
  agent_id: String,
  category: String,
  tier: String,
  content: String,
  reinforcement_score: Float,
  created_at: String,
  updated_at: String,
  access_count: Int,
  last_accessed_at: String,
  tags: [String],
  metadata: String
}
`;

export const CREATE_MEMORY_VEC_TABLE = `
:create memory_vec {
  id: String
  =>
  embedding: <F32; 384>
}
`;

export const CREATE_MEMORY_LINKS_TABLE = `
:create memory_links {
  id: String
  =>
  source_id: String,
  target_id: String,
  relationship_type: String,
  strength: Float,
  created_at: String
}
`;

export const CREATE_HNSW_INDEX = `
::hnsw create memory_vec:embedding_idx {
  dim: 384,
  m: 16,
  ef_construction: 100,
  dtype: F32,
  fields: [embedding],
  distance: Cosine,
  filter: null
}
`;

export async function initializeSchema(db: CozoDb): Promise<void> {
  const tables = ['memories', 'memory_vec', 'memory_links'];

  for (const table of tables) {
    try {
      await db.run(`?[x] := *${table}[x] :limit 1`);
    } catch {
      switch (table) {
        case 'memories':
          await db.run(CREATE_MEMORIES_TABLE);
          break;
        case 'memory_vec':
          await db.run(CREATE_MEMORY_VEC_TABLE);
          break;
        case 'memory_links':
          await db.run(CREATE_MEMORY_LINKS_TABLE);
          break;
      }
    }
  }

  try {
    await db.run(CREATE_HNSW_INDEX);
  } catch {
  }
}

export async function dropSchema(db: CozoDb): Promise<void> {
  try {
    await db.run('::hnsw drop memory_vec:embedding_idx');
  } catch {
  }

  const tables = ['memory_links', 'memory_vec', 'memories'];
  for (const table of tables) {
    try {
      await db.run(`::remove ${table}`);
    } catch {
    }
  }
}

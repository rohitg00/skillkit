# @skillkit/mcp-memory

MCP (Model Context Protocol) server for SkillKit persistent memory. Enables Claude, Cursor, and other MCP-compatible tools to store, search, and recall memories with semantic embeddings.

## Installation

```bash
npm install @skillkit/mcp-memory
# or
pnpm add @skillkit/mcp-memory
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "skillkit-memory": {
      "command": "npx",
      "args": ["@skillkit/mcp-memory"],
      "env": {
        "SKILLKIT_AGENT_ID": "claude-desktop"
      }
    }
  }
}
```

## Usage with Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "skillkit-memory": {
      "command": "npx",
      "args": ["@skillkit/mcp-memory"],
      "env": {
        "SKILLKIT_AGENT_ID": "cursor"
      }
    }
  }
}
```

## Environment Variables

- `SKILLKIT_AGENT_ID` - Agent identifier for memory isolation (default: `mcp-memory-server`)
- `SKILLKIT_MEMORY_DB_PATH` - Custom database path (default: `~/.skillkit/memory.db`)

## Available Tools

### memory_store
Store a new memory with semantic embedding.

```
memory_store({
  content: "User prefers TypeScript over JavaScript",
  category: "preference",
  tags: ["language", "coding"]
})
```

### memory_search
Semantic search through stored memories.

```
memory_search({
  query: "What programming languages does the user prefer?",
  limit: 5,
  threshold: 0.5
})
```

### memory_recall
Recall memories by category, tier, or tags.

```
memory_recall({
  category: "decision",
  tier: "long",
  limit: 10
})
```

### memory_get
Get a specific memory by ID.

```
memory_get({ id: "memory-uuid" })
```

### memory_forget
Delete a memory.

```
memory_forget({ id: "memory-uuid" })
```

### memory_link
Create relationships between memories.

```
memory_link({
  sourceId: "memory-1",
  targetId: "memory-2",
  relationshipType: "supports",
  strength: 0.8
})
```

### memory_reinforce
Strengthen or weaken a memory. Strong memories get promoted to long-term tier.

```
memory_reinforce({
  id: "memory-uuid",
  amount: 0.1  // positive to strengthen, negative to weaken
})
```

### memory_stats
Get memory statistics.

```
memory_stats({})
```

## Memory Categories

- `fact` - Factual information
- `decision` - Decisions made
- `preference` - User preferences
- `pattern` - Observed patterns
- `insight` - Derived insights
- `reasoning` - Reasoning chains

## Memory Tiers

- `warm` - Recent, frequently accessed memories
- `long` - Consolidated long-term memories

Memories are automatically promoted from `warm` to `long` based on access count, reinforcement score, and age.

## Resources

The server exposes two resources:

- `memory://stats` - Current memory statistics (JSON)
- `memory://recent` - 10 most recent memories (JSON)

## License

Apache-2.0

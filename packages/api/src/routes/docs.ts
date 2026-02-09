import { Hono } from 'hono';

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'SkillKit',
    version: '1.12.0',
    description: 'Skill Discovery API for AI coding agents. Search, browse, and retrieve skills from the SkillKit marketplace (15,000+ skills across 44 agents).',
    license: { name: 'Apache-2.0', url: 'https://opensource.org/licenses/Apache-2.0' },
    contact: { name: 'SkillKit', url: 'https://github.com/rohitg00/skillkit' },
  },
  servers: [
    { url: 'http://localhost:3737', description: 'Local development' },
  ],
  paths: {
    '/search': {
      get: {
        summary: 'Search skills',
        description: 'Locate agent skills matching a query, ranked by multi-signal relevance (content, query match, popularity, references).',
        operationId: 'searchSkillsGet',
        tags: ['Search'],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 200 }, description: 'Search query' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }, description: 'Max results to return' },
          { name: 'include_content', in: 'query', schema: { type: 'boolean', default: false }, description: 'Include full skill content in response' },
        ],
        responses: {
          '200': { description: 'Search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } },
          '400': { description: 'Missing query parameter', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '429': { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/RateLimitResponse' } } } },
        },
      },
      post: {
        summary: 'Search skills with filters',
        description: 'Search with advanced filters including tags, category, and source.',
        operationId: 'searchSkillsPost',
        tags: ['Search'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string', description: 'Search query' },
                  limit: { type: 'integer', default: 20, minimum: 1, maximum: 100, description: 'Max results' },
                  include_content: { type: 'boolean', default: false, description: 'Include full content' },
                  filters: {
                    type: 'object',
                    properties: {
                      tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
                      category: { type: 'string', description: 'Filter by category' },
                      source: { type: 'string', description: 'Filter by source repo' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Filtered search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } },
          '400': { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/skills/{owner}/{repo}/{id}': {
      get: {
        summary: 'Get skill by ID',
        description: 'Retrieve a specific skill by its source repository and name.',
        operationId: 'getSkill',
        tags: ['Skills'],
        parameters: [
          { name: 'owner', in: 'path', required: true, schema: { type: 'string' }, description: 'Repository owner' },
          { name: 'repo', in: 'path', required: true, schema: { type: 'string' }, description: 'Repository name' },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Skill name' },
        ],
        responses: {
          '200': { description: 'Skill details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Skill' } } } },
          '404': { description: 'Skill not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/trending': {
      get: {
        summary: 'Trending skills',
        description: 'Get top skills ranked by multi-signal relevance score (content availability, popularity, references).',
        operationId: 'getTrending',
        tags: ['Discovery'],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }, description: 'Max results' },
        ],
        responses: {
          '200': { description: 'Trending skills', content: { 'application/json': { schema: { $ref: '#/components/schemas/TrendingResponse' } } } },
        },
      },
    },
    '/categories': {
      get: {
        summary: 'Skill categories',
        description: 'List all skill categories and tags with their counts, sorted by popularity.',
        operationId: 'getCategories',
        tags: ['Discovery'],
        responses: {
          '200': { description: 'Category list', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoriesResponse' } } } },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Server health status including version, skill count, and uptime.',
        operationId: 'getHealth',
        tags: ['System'],
        responses: {
          '200': { description: 'Server health', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } } },
        },
      },
    },
    '/cache/stats': {
      get: {
        summary: 'Cache statistics',
        description: 'Cache hit/miss rates and current size.',
        operationId: 'getCacheStats',
        tags: ['System'],
        responses: {
          '200': { description: 'Cache stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/CacheStatsResponse' } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      Skill: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Skill name' },
          description: { type: 'string', description: 'Skill description' },
          source: { type: 'string', description: 'Source repository (owner/repo)' },
          repo: { type: 'string', description: 'Repository URL' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Skill tags' },
          category: { type: 'string', description: 'Skill category' },
          content: { type: 'string', description: 'Full SKILL.md content (when requested)' },
          stars: { type: 'integer', description: 'GitHub stars' },
          installs: { type: 'integer', description: 'Install count' },
        },
        required: ['name', 'source'],
      },
      SearchResponse: {
        type: 'object',
        properties: {
          skills: { type: 'array', items: { $ref: '#/components/schemas/Skill' } },
          total: { type: 'integer', description: 'Total matching skills' },
          query: { type: 'string', description: 'Original query' },
          limit: { type: 'integer', description: 'Applied limit' },
        },
        required: ['skills', 'total', 'query', 'limit'],
      },
      TrendingResponse: {
        type: 'object',
        properties: {
          skills: { type: 'array', items: { $ref: '#/components/schemas/Skill' } },
          limit: { type: 'integer' },
        },
        required: ['skills', 'limit'],
      },
      CategoriesResponse: {
        type: 'object',
        properties: {
          categories: { type: 'array', items: { $ref: '#/components/schemas/CategoryCount' } },
          total: { type: 'integer' },
        },
        required: ['categories', 'total'],
      },
      CategoryCount: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'integer' },
        },
        required: ['name', 'count'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok'] },
          version: { type: 'string' },
          skillCount: { type: 'integer' },
          uptime: { type: 'number', description: 'Uptime in seconds' },
        },
        required: ['status', 'version', 'skillCount', 'uptime'],
      },
      CacheStatsResponse: {
        type: 'object',
        properties: {
          hits: { type: 'integer' },
          misses: { type: 'integer' },
          size: { type: 'integer' },
          maxSize: { type: 'integer' },
          hitRate: { type: 'number' },
        },
        required: ['hits', 'misses', 'size', 'maxSize', 'hitRate'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      RateLimitResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          retryAfter: { type: 'integer', description: 'Seconds until rate limit resets' },
        },
        required: ['error', 'retryAfter'],
      },
    },
  },
  tags: [
    { name: 'Search', description: 'Skill search and filtering' },
    { name: 'Skills', description: 'Individual skill retrieval' },
    { name: 'Discovery', description: 'Trending skills and categories' },
    { name: 'System', description: 'Health checks and diagnostics' },
  ],
};

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillKit API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #1a1a2e; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { max-width: 1200px; margin: 0 auto; }
    .swagger-ui .info .title { font-family: monospace; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`;

export function docsRoutes() {
  const app = new Hono();

  app.get('/openapi.json', (c) => {
    return c.json(OPENAPI_SPEC);
  });

  app.get('/docs', (c) => {
    return c.html(SWAGGER_HTML);
  });

  app.get('/', (c) => {
    return c.json({
      name: 'SkillKit API',
      version: '1.12.0',
      docs: '/docs',
      openapi: '/openapi.json',
      endpoints: {
        search: 'GET /search?q=...',
        searchFiltered: 'POST /search',
        skill: 'GET /skills/:owner/:repo/:id',
        trending: 'GET /trending',
        categories: 'GET /categories',
        health: 'GET /health',
        cache: 'GET /cache/stats',
      },
    });
  });

  return app;
}

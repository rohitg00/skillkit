import {
  type ConnectorCategory,
  type ConnectorPlaceholder,
  type ConnectorMapping,
  type ConnectorConfig,
  type PlaceholderMatch,
  type PlaceholderReplacement,
  type ConnectorAnalysis,
  STANDARD_PLACEHOLDERS,
  ConnectorCategorySchema,
} from './types.js';

const PLACEHOLDER_REGEX = /~~(\w+)/g;

export function detectPlaceholders(content: string): PlaceholderMatch[] {
  const matches: PlaceholderMatch[] = [];
  const lines = content.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let match: RegExpExecArray | null;

    const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');
    while ((match = regex.exec(line)) !== null) {
      const placeholder = match[0];
      const categoryName = match[1].toLowerCase();

      let category: ConnectorCategory | null = null;
      try {
        category = ConnectorCategorySchema.parse(categoryName);
      } catch {
        category = null;
      }

      const contextStart = Math.max(0, match.index - 20);
      const contextEnd = Math.min(line.length, match.index + placeholder.length + 20);
      const context = line.slice(contextStart, contextEnd);

      matches.push({
        placeholder,
        category,
        line: lineNum + 1,
        column: match.index + 1,
        context: context.trim(),
      });
    }
  }

  return matches;
}

export function analyzePlaceholders(content: string): ConnectorAnalysis {
  const matches = detectPlaceholders(content);
  const categories = new Set<ConnectorCategory>();
  let requiredCount = 0;
  let optionalCount = 0;
  let hasUnknownPlaceholders = false;

  for (const match of matches) {
    if (match.category) {
      categories.add(match.category);
      const standardPlaceholder = STANDARD_PLACEHOLDERS[match.category];
      if (standardPlaceholder?.required) {
        requiredCount++;
      } else {
        optionalCount++;
      }
    } else {
      hasUnknownPlaceholders = true;
    }
  }

  return {
    placeholders: matches,
    categories: Array.from(categories),
    requiredCount,
    optionalCount,
    hasUnknownPlaceholders,
  };
}

export function replacePlaceholders(
  content: string,
  mappings: ConnectorMapping[]
): { result: string; replacements: PlaceholderReplacement[] } {
  const replacements: PlaceholderReplacement[] = [];
  let result = content;

  for (const mapping of mappings) {
    const regex = new RegExp(escapeRegExp(mapping.placeholder), 'g');
    const originalMatches = content.match(regex);

    if (originalMatches) {
      result = result.replace(regex, mapping.tool);

      const categoryName = mapping.placeholder.replace('~~', '').toLowerCase();
      let category: ConnectorCategory | null = null;
      try {
        category = ConnectorCategorySchema.parse(categoryName);
      } catch {
        category = null;
      }

      replacements.push({
        original: mapping.placeholder,
        replacement: mapping.tool,
        category,
      });
    }
  }

  return { result, replacements };
}

export function applyConnectorConfig(
  content: string,
  config: ConnectorConfig
): { result: string; replacements: PlaceholderReplacement[] } {
  return replacePlaceholders(content, config.mappings);
}

export function getPlaceholderInfo(placeholder: string): ConnectorPlaceholder | null {
  const categoryName = placeholder.replace('~~', '').toLowerCase();

  try {
    const category = ConnectorCategorySchema.parse(categoryName);
    return STANDARD_PLACEHOLDERS[category];
  } catch {
    return null;
  }
}

export function generateConnectorsMarkdown(analysis: ConnectorAnalysis): string {
  const lines: string[] = [];

  lines.push('# Connectors');
  lines.push('');
  lines.push('This skill uses the following connector placeholders. Replace them with your specific tools.');
  lines.push('');
  lines.push('| Placeholder | Category | Description | Examples |');
  lines.push('|-------------|----------|-------------|----------|');

  for (const match of analysis.placeholders) {
    if (match.category) {
      const info = STANDARD_PLACEHOLDERS[match.category];
      lines.push(
        `| \`${match.placeholder}\` | ${match.category} | ${info.description} | ${info.examples.slice(0, 3).join(', ')} |`
      );
    } else {
      lines.push(
        `| \`${match.placeholder}\` | custom | Custom integration | - |`
      );
    }
  }

  lines.push('');
  lines.push('## How to Customize');
  lines.push('');
  lines.push('1. Find all placeholders: `grep -n "~~" SKILL.md`');
  lines.push('2. Replace each `~~category` with your specific tool name');
  lines.push('3. Configure MCP server in `.mcp.json` if needed');
  lines.push('');

  return lines.join('\n');
}

export function createConnectorConfig(
  mappings: Array<{ placeholder: string; tool: string; mcpServer?: string }>
): ConnectorConfig {
  return {
    version: 1,
    mappings: mappings.map((m) => ({
      placeholder: m.placeholder,
      tool: m.tool,
      mcpServer: m.mcpServer,
    })),
  };
}

export function validateConnectorConfig(
  config: ConnectorConfig,
  content: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const analysis = analyzePlaceholders(content);
  const placeholdersInContent = new Set(analysis.placeholders.map((p) => p.placeholder));
  const mappedPlaceholders = new Set(config.mappings.map((m) => m.placeholder));

  for (const placeholder of placeholdersInContent) {
    if (!mappedPlaceholders.has(placeholder)) {
      const info = getPlaceholderInfo(placeholder);
      if (info?.required) {
        errors.push(`Required placeholder ${placeholder} is not mapped`);
      } else {
        warnings.push(`Optional placeholder ${placeholder} is not mapped`);
      }
    }
  }

  for (const mapping of config.mappings) {
    if (!placeholdersInContent.has(mapping.placeholder)) {
      warnings.push(`Mapping for ${mapping.placeholder} exists but placeholder not found in content`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function suggestMappingsFromMcp(
  mcpServers: string[]
): ConnectorMapping[] {
  const suggestions: ConnectorMapping[] = [];
  const serverLower = mcpServers.map((s) => s.toLowerCase());

  const serverToCategory: Record<string, { category: ConnectorCategory; tool: string }[]> = {
    slack: [{ category: 'chat', tool: 'Slack' }],
    teams: [{ category: 'chat', tool: 'Microsoft Teams' }],
    discord: [{ category: 'chat', tool: 'Discord' }],
    gmail: [{ category: 'email', tool: 'Gmail' }],
    outlook: [{ category: 'email', tool: 'Outlook' }],
    sendgrid: [{ category: 'email', tool: 'SendGrid' }],
    salesforce: [{ category: 'crm', tool: 'Salesforce' }],
    hubspot: [{ category: 'crm', tool: 'HubSpot' }],
    pipedrive: [{ category: 'crm', tool: 'Pipedrive' }],
    notion: [{ category: 'docs', tool: 'Notion' }],
    confluence: [{ category: 'docs', tool: 'Confluence' }],
    google: [
      { category: 'docs', tool: 'Google Docs' },
      { category: 'calendar', tool: 'Google Calendar' },
      { category: 'storage', tool: 'Google Drive' },
    ],
    bigquery: [{ category: 'data', tool: 'BigQuery' }],
    snowflake: [{ category: 'data', tool: 'Snowflake' }],
    postgres: [{ category: 'data', tool: 'PostgreSQL' }],
    supabase: [{ category: 'data', tool: 'Supabase' }],
    clearbit: [{ category: 'enrichment', tool: 'Clearbit' }],
    zoominfo: [{ category: 'enrichment', tool: 'ZoomInfo' }],
    apollo: [{ category: 'enrichment', tool: 'Apollo' }],
    openai: [{ category: 'ai', tool: 'OpenAI' }],
    anthropic: [{ category: 'ai', tool: 'Anthropic Claude' }],
  };

  for (const server of serverLower) {
    for (const [keyword, mappings] of Object.entries(serverToCategory)) {
      if (server.includes(keyword)) {
        for (const mapping of mappings) {
          suggestions.push({
            placeholder: STANDARD_PLACEHOLDERS[mapping.category].placeholder,
            tool: mapping.tool,
            mcpServer: server,
          });
        }
      }
    }
  }

  return suggestions;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { z } from 'zod';

export const ConnectorCategorySchema = z.enum([
  'crm',
  'chat',
  'email',
  'calendar',
  'docs',
  'data',
  'search',
  'enrichment',
  'analytics',
  'storage',
  'notifications',
  'ai',
  'custom',
]);

export type ConnectorCategory = z.infer<typeof ConnectorCategorySchema>;

export const ConnectorPlaceholderSchema = z.object({
  placeholder: z.string(),
  category: ConnectorCategorySchema,
  description: z.string(),
  examples: z.array(z.string()).default([]),
  required: z.boolean().default(false),
});

export type ConnectorPlaceholder = z.infer<typeof ConnectorPlaceholderSchema>;

export const ConnectorMappingSchema = z.object({
  placeholder: z.string(),
  tool: z.string(),
  mcpServer: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

export type ConnectorMapping = z.infer<typeof ConnectorMappingSchema>;

export const ConnectorConfigSchema = z.object({
  version: z.number().default(1),
  mappings: z.array(ConnectorMappingSchema),
  description: z.string().optional(),
});

export type ConnectorConfig = z.infer<typeof ConnectorConfigSchema>;

export const STANDARD_PLACEHOLDERS: Record<ConnectorCategory, ConnectorPlaceholder> = {
  crm: {
    placeholder: '~~CRM',
    category: 'crm',
    description: 'Customer Relationship Management system',
    examples: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM'],
    required: false,
  },
  chat: {
    placeholder: '~~chat',
    category: 'chat',
    description: 'Team communication and messaging platform',
    examples: ['Slack', 'Microsoft Teams', 'Discord'],
    required: false,
  },
  email: {
    placeholder: '~~email',
    category: 'email',
    description: 'Email service for sending and receiving messages',
    examples: ['Gmail', 'Outlook', 'SendGrid'],
    required: false,
  },
  calendar: {
    placeholder: '~~calendar',
    category: 'calendar',
    description: 'Calendar and scheduling system',
    examples: ['Google Calendar', 'Outlook Calendar', 'Calendly'],
    required: false,
  },
  docs: {
    placeholder: '~~docs',
    category: 'docs',
    description: 'Document management and collaboration',
    examples: ['Google Docs', 'Notion', 'Confluence', 'Coda'],
    required: false,
  },
  data: {
    placeholder: '~~data',
    category: 'data',
    description: 'Data warehouse or database',
    examples: ['BigQuery', 'Snowflake', 'PostgreSQL', 'Databricks'],
    required: false,
  },
  search: {
    placeholder: '~~search',
    category: 'search',
    description: 'Enterprise search across tools',
    examples: ['Glean', 'Elastic', 'Algolia'],
    required: false,
  },
  enrichment: {
    placeholder: '~~enrichment',
    category: 'enrichment',
    description: 'Data enrichment service',
    examples: ['Clearbit', 'ZoomInfo', 'Apollo'],
    required: false,
  },
  analytics: {
    placeholder: '~~analytics',
    category: 'analytics',
    description: 'Analytics and reporting platform',
    examples: ['Mixpanel', 'Amplitude', 'Google Analytics'],
    required: false,
  },
  storage: {
    placeholder: '~~storage',
    category: 'storage',
    description: 'File storage service',
    examples: ['Google Drive', 'Dropbox', 'S3', 'Box'],
    required: false,
  },
  notifications: {
    placeholder: '~~notifications',
    category: 'notifications',
    description: 'Notification and alerting service',
    examples: ['PagerDuty', 'Opsgenie', 'SMS'],
    required: false,
  },
  ai: {
    placeholder: '~~ai',
    category: 'ai',
    description: 'AI/ML model or service',
    examples: ['OpenAI', 'Anthropic', 'Hugging Face'],
    required: false,
  },
  custom: {
    placeholder: '~~custom',
    category: 'custom',
    description: 'Custom integration',
    examples: [],
    required: false,
  },
};

export interface PlaceholderMatch {
  placeholder: string;
  category: ConnectorCategory | null;
  line: number;
  column: number;
  context: string;
}

export interface PlaceholderReplacement {
  original: string;
  replacement: string;
  category: ConnectorCategory | null;
}

export interface ConnectorAnalysis {
  placeholders: PlaceholderMatch[];
  categories: ConnectorCategory[];
  requiredCount: number;
  optionalCount: number;
  hasUnknownPlaceholders: boolean;
}

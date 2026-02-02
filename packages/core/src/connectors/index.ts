export * from './types.js';
export * from './utils.js';

export {
  STANDARD_PLACEHOLDERS,
  ConnectorCategorySchema,
  ConnectorPlaceholderSchema,
  ConnectorMappingSchema,
  ConnectorConfigSchema,
} from './types.js';

export {
  detectPlaceholders,
  analyzePlaceholders,
  replacePlaceholders,
  applyConnectorConfig,
  getPlaceholderInfo,
  generateConnectorsMarkdown,
  createConnectorConfig,
  validateConnectorConfig,
  suggestMappingsFromMcp,
} from './utils.js';

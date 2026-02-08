import { type SecurityRule, Severity, ThreatCategory } from '../types.js';

export const dataExfiltrationRules: SecurityRule[] = [
  {
    id: 'DE001',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.HIGH,
    patterns: [
      /https?:\/\/(?:discord(?:app)?\.com\/api\/webhooks|ptb\.discord\.com\/api\/webhooks)\//i,
      /https?:\/\/hooks\.slack\.com\/services\//i,
      /https?:\/\/api\.telegram\.org\/bot/i,
    ],
    description: 'Webhook URL detected: Discord, Slack, or Telegram webhook endpoint',
    remediation: 'Remove hardcoded webhook URLs. Use environment variables or configuration files.',
  },
  {
    id: 'DE002',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.HIGH,
    patterns: [
      /(?:fetch|axios|request|got|ky|undici)\s*(?:\.\s*post)?\s*\([^)]*(?:process\.env|credentials|password|secret|token)/i,
    ],
    description: 'HTTP request sending sensitive data: credentials or environment variables in request',
    remediation: 'Never send credentials or env vars to external services from skill code.',
  },
  {
    id: 'DE003',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.MEDIUM,
    patterns: [
      /process\.env\[/,
      /process\.env\./,
      /os\.environ/,
      /\$ENV\{/,
    ],
    excludePatterns: [/process\.env\.NODE_ENV/, /process\.env\.HOME/, /process\.env\.PATH/],
    description: 'Environment variable access: skill reads environment variables',
    remediation: 'Skills should declare required env vars in manifest, not access them directly.',
  },
  {
    id: 'DE004',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.HIGH,
    patterns: [
      /readFile.*(?:\.env|credentials|\.aws|\.ssh|\.gnupg|\.netrc)/i,
      /open\s*\(\s*['"].*(?:\.env|credentials|\.aws|\.ssh|\.gnupg)/i,
      /cat\s+.*(?:\.env|credentials|id_rsa|\.aws\/)/i,
    ],
    description: 'Sensitive file access: reading credential or configuration files',
    remediation: 'Skills should not read user credential files.',
  },
  {
    id: 'DE005',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.MEDIUM,
    patterns: [
      /new\s+WebSocket\s*\(\s*['"`]/,
      /\bio\.connect\s*\(/,
    ],
    description: 'WebSocket connection: potential covert data channel',
    remediation: 'Document all network connections. Avoid persistent connections in skills.',
  },
  {
    id: 'DE006',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.HIGH,
    patterns: [
      /https?:\/\/[a-z0-9]+\.ngrok\b/i,
      /https?:\/\/[a-z0-9]+\.serveo\.net/i,
      /https?:\/\/[a-z0-9]+\.loca\.lt/i,
      /https?:\/\/[a-z0-9]+\.burpcollaborator\.net/i,
    ],
    description: 'Tunneling service URL: potential data exfiltration via tunnel',
    remediation: 'Remove tunneling service URLs. Use official API endpoints.',
  },
  {
    id: 'DE007',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.MEDIUM,
    patterns: [
      /dns\.resolve/i,
      /\bdnslookup\b/i,
      /\bnslookup\s+/i,
      /\bdig\s+/i,
    ],
    description: 'DNS-based data exfiltration: DNS queries can encode stolen data',
    remediation: 'Skills should not perform DNS queries unless explicitly required.',
  },
  {
    id: 'DE008',
    category: ThreatCategory.DATA_EXFILTRATION,
    severity: Severity.MEDIUM,
    patterns: [
      /(?:fetch|axios|request|got)\s*\(\s*['"`]https?:\/\/(?!localhost|127\.0\.0\.1)/,
    ],
    excludePatterns: [/(?:npmjs\.org|github\.com|githubusercontent\.com|registry\.npmmirror)/],
    fileTypes: ['typescript', 'javascript'],
    description: 'External HTTP request: skill makes outbound network call',
    remediation: 'Declare all external URLs in skill manifest. Minimize network access.',
  },
];

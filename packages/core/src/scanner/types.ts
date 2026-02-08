export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
  SAFE = 'safe',
}

export enum ThreatCategory {
  PROMPT_INJECTION = 'prompt-injection',
  COMMAND_INJECTION = 'command-injection',
  DATA_EXFILTRATION = 'data-exfiltration',
  TOOL_ABUSE = 'tool-abuse',
  HARDCODED_SECRETS = 'hardcoded-secrets',
  UNICODE_STEGANOGRAPHY = 'unicode-steganography',
  OBFUSCATION = 'obfuscation',
  SOCIAL_ENGINEERING = 'social-engineering',
  AUTONOMY_ABUSE = 'autonomy-abuse',
  POLICY_VIOLATION = 'policy-violation',
}

export interface SecurityRule {
  id: string;
  category: ThreatCategory;
  severity: Severity;
  patterns: RegExp[];
  excludePatterns?: RegExp[];
  fileTypes?: string[];
  multiline?: boolean;
  description: string;
  remediation: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  category: ThreatCategory;
  severity: Severity;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  snippet?: string;
  remediation?: string;
  analyzer: string;
  aitech?: string;
}

export interface ScanResult {
  skillPath: string;
  skillName: string;
  verdict: 'pass' | 'warn' | 'fail';
  findings: Finding[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  duration: number;
  analyzersUsed: string[];
}

export interface ScanOptions {
  failOnSeverity?: Severity;
  skipRules?: string[];
}

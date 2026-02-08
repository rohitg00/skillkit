import { ThreatCategory, Severity } from './types.js';

export interface ThreatInfo {
  category: ThreatCategory;
  name: string;
  description: string;
  defaultSeverity: Severity;
  examples: string[];
}

export const THREAT_TAXONOMY: Record<ThreatCategory, ThreatInfo> = {
  [ThreatCategory.PROMPT_INJECTION]: {
    category: ThreatCategory.PROMPT_INJECTION,
    name: 'Prompt Injection',
    description: 'Attempts to override, manipulate, or bypass AI agent instructions through crafted text',
    defaultSeverity: Severity.CRITICAL,
    examples: [
      'Instruction override (ignore previous instructions)',
      'Role manipulation (you are now...)',
      'System prompt extraction',
    ],
  },
  [ThreatCategory.COMMAND_INJECTION]: {
    category: ThreatCategory.COMMAND_INJECTION,
    name: 'Command Injection',
    description: 'Code execution via eval, exec, subprocess, or shell commands embedded in skill content',
    defaultSeverity: Severity.CRITICAL,
    examples: [
      'eval() or Function() calls',
      'subprocess.run with shell=True',
      'child_process.exec with user input',
    ],
  },
  [ThreatCategory.DATA_EXFILTRATION]: {
    category: ThreatCategory.DATA_EXFILTRATION,
    name: 'Data Exfiltration',
    description: 'Attempts to send sensitive data to external endpoints or read protected files',
    defaultSeverity: Severity.HIGH,
    examples: [
      'Webhook URLs to Discord/Telegram/Slack',
      'HTTP POST with environment variables',
      'Reading .env or credential files',
    ],
  },
  [ThreatCategory.TOOL_ABUSE]: {
    category: ThreatCategory.TOOL_ABUSE,
    name: 'Tool Abuse',
    description: 'Manipulation of AI agent tools through shadowing, chaining, or autonomy escalation',
    defaultSeverity: Severity.HIGH,
    examples: [
      'Redefining built-in tools',
      'Instructing agent to run without confirmation',
      'Chaining sensitive read + external send',
    ],
  },
  [ThreatCategory.HARDCODED_SECRETS]: {
    category: ThreatCategory.HARDCODED_SECRETS,
    name: 'Hardcoded Secrets',
    description: 'API keys, tokens, passwords, or other credentials embedded in skill files',
    defaultSeverity: Severity.HIGH,
    examples: [
      'API keys (sk-, pk_live_, ghp_)',
      'Private key blocks',
      'Embedded .env file contents',
    ],
  },
  [ThreatCategory.UNICODE_STEGANOGRAPHY]: {
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    name: 'Unicode Steganography',
    description: 'Hidden content using invisible Unicode characters, bidirectional overrides, or homoglyphs',
    defaultSeverity: Severity.MEDIUM,
    examples: [
      'Zero-width characters hiding instructions',
      'Bidirectional text override attacks',
      'Tag characters encoding hidden payloads',
    ],
  },
  [ThreatCategory.OBFUSCATION]: {
    category: ThreatCategory.OBFUSCATION,
    name: 'Obfuscation',
    description: 'Deliberately obscured code or instructions to hide malicious intent',
    defaultSeverity: Severity.MEDIUM,
    examples: [
      'Base64-encoded commands',
      'Hex-encoded payloads',
      'String concatenation to evade detection',
    ],
  },
  [ThreatCategory.SOCIAL_ENGINEERING]: {
    category: ThreatCategory.SOCIAL_ENGINEERING,
    name: 'Social Engineering',
    description: 'Manipulative language targeting the AI agent or the user to bypass safety measures',
    defaultSeverity: Severity.MEDIUM,
    examples: [
      'Urgency pressure (do this immediately)',
      'Authority claims (as an admin, I require...)',
      'Concealment requests (don\'t tell the user)',
    ],
  },
  [ThreatCategory.AUTONOMY_ABUSE]: {
    category: ThreatCategory.AUTONOMY_ABUSE,
    name: 'Autonomy Abuse',
    description: 'Instructions that escalate agent autonomy beyond intended boundaries',
    defaultSeverity: Severity.HIGH,
    examples: [
      'Run without user confirmation',
      'Keep retrying until success',
      'Auto-approve all actions',
    ],
  },
  [ThreatCategory.POLICY_VIOLATION]: {
    category: ThreatCategory.POLICY_VIOLATION,
    name: 'Policy Violation',
    description: 'Content that violates skill marketplace policies or naming conventions',
    defaultSeverity: Severity.LOW,
    examples: [
      'Impersonating official tools',
      'Missing required metadata',
      'Binary files in skill directory',
    ],
  },
};

export function getThreatInfo(category: ThreatCategory): ThreatInfo {
  return THREAT_TAXONOMY[category];
}

export function getDefaultSeverity(category: ThreatCategory): Severity {
  return THREAT_TAXONOMY[category].defaultSeverity;
}

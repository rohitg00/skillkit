import { type SecurityRule, Severity, ThreatCategory } from '../types.js';

export const unicodeRules: SecurityRule[] = [
  {
    id: 'UC001',
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    severity: Severity.MEDIUM,
    patterns: [/\u200B|\u200C|\u200D|\uFEFF/],
    description: 'Zero-width characters detected: may hide invisible instructions',
    remediation: 'Remove zero-width characters (U+200B, U+200C, U+200D, U+FEFF).',
  },
  {
    id: 'UC002',
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    severity: Severity.HIGH,
    patterns: [/[\u202A-\u202E]/],
    description: 'Bidirectional text override: can reverse displayed text direction to hide content',
    remediation: 'Remove bidirectional override characters (U+202A-U+202E).',
  },
  {
    id: 'UC003',
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    severity: Severity.HIGH,
    patterns: [/[\u2066-\u2069]/],
    description: 'Bidirectional isolate characters: can create hidden text regions',
    remediation: 'Remove bidirectional isolate characters (U+2066-U+2069).',
  },
  {
    id: 'UC004',
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    severity: Severity.HIGH,
    patterns: [/[\u{E0001}-\u{E007F}]/u],
    description: 'Tag characters detected: Unicode tag block can encode hidden payloads',
    remediation: 'Remove Unicode tag characters (U+E0001-U+E007F).',
  },
  {
    id: 'UC005',
    category: ThreatCategory.UNICODE_STEGANOGRAPHY,
    severity: Severity.MEDIUM,
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional detection of control characters
    patterns: [/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/],
    description: 'Control characters detected: non-printable characters in content',
    remediation: 'Remove control characters. Use only printable Unicode content.',
  },
  {
    id: 'UC006',
    category: ThreatCategory.OBFUSCATION,
    severity: Severity.MEDIUM,
    patterns: [
      /atob\s*\(\s*['"`][A-Za-z0-9+/=]{40,}['"`]\s*\)/,
      /Buffer\.from\s*\(\s*['"`][A-Za-z0-9+/=]{40,}['"`]\s*,\s*['"`]base64['"`]\s*\)/,
      /base64\.b64decode\s*\(\s*['"`][A-Za-z0-9+/=]{40,}['"`]\s*\)/,
    ],
    description: 'Base64-encoded payload: long encoded string being decoded at runtime',
    remediation: 'Avoid embedding base64-encoded payloads. Use plain text or documented data formats.',
  },
  {
    id: 'UC007',
    category: ThreatCategory.OBFUSCATION,
    severity: Severity.MEDIUM,
    patterns: [
      /\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){9,}/,
      /\\u[0-9a-fA-F]{4}(?:\\u[0-9a-fA-F]{4}){9,}/,
    ],
    description: 'Hex/Unicode escape sequences: potential obfuscated content',
    remediation: 'Use readable strings instead of hex or unicode escape sequences.',
  },
];

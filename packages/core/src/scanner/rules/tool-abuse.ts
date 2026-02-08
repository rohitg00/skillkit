import { type SecurityRule, Severity, ThreatCategory } from '../types.js';

export const toolAbuseRules: SecurityRule[] = [
  {
    id: 'TA001',
    category: ThreatCategory.TOOL_ABUSE,
    severity: Severity.HIGH,
    patterns: [
      /(?:override|replace|redefine|shadow)\s+(?:the\s+)?(?:built-?in|default|original)\s+(?:tool|function|command)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Tool shadowing: instructs agent to override built-in tools',
    remediation: 'Skills should extend functionality, not replace built-in tools.',
  },
  {
    id: 'TA002',
    category: ThreatCategory.AUTONOMY_ABUSE,
    severity: Severity.HIGH,
    patterns: [
      /(?:keep|continue)\s+(?:retrying|trying|running)\s+(?:until|without)/i,
      /(?:run|execute|proceed)\s+without\s+(?:confirmation|approval|asking)/i,
      /(?:auto-?approve|skip\s+confirmation|bypass\s+approval)/i,
      /(?:don'?t|do\s+not|never)\s+(?:ask|prompt|wait)\s+(?:for|the)\s+(?:permission|confirmation|approval)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Autonomy abuse: instructs agent to bypass user confirmation',
    remediation: 'Skills must respect user confirmation flows. Remove autonomy escalation.',
  },
  {
    id: 'TA003',
    category: ThreatCategory.TOOL_ABUSE,
    severity: Severity.MEDIUM,
    patterns: [
      /(?:discover|find|list|enumerate)\s+(?:all\s+)?(?:available\s+)?(?:tools|capabilities|functions)/i,
      /(?:enable|activate|unlock)\s+(?:all\s+)?(?:hidden|disabled|extra)\s+(?:tools|capabilities)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Capability inflation: attempts to discover or enable additional tools',
    remediation: 'Skills should use only declared tools. Do not probe for hidden capabilities.',
  },
  {
    id: 'TA004',
    category: ThreatCategory.TOOL_ABUSE,
    severity: Severity.HIGH,
    patterns: [
      /read\s+(?:the\s+)?(?:file|contents?).*(?:then|and)\s+(?:send|post|upload|transmit)/i,
      /(?:access|read|get)\s+.*(?:credential|secret|key|token).*(?:then|and)\s+(?:send|share|post)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Tool chaining: read sensitive data then send externally',
    remediation: 'Skills should not combine file reading with external transmission.',
  },
  {
    id: 'TA005',
    category: ThreatCategory.SOCIAL_ENGINEERING,
    severity: Severity.MEDIUM,
    patterns: [
      /(?:urgent|immediately|critical|emergency)[!:]\s+(?:you\s+must|run|execute|do\s+this)/i,
      /(?:as\s+(?:an?\s+)?(?:admin|root|superuser|administrator)),?\s+(?:I|we)\s+(?:require|need|demand)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Social engineering: uses urgency or authority to manipulate agent',
    remediation: 'Remove manipulative language. Provide clear, neutral instructions.',
  },
  {
    id: 'TA006',
    category: ThreatCategory.TOOL_ABUSE,
    severity: Severity.MEDIUM,
    patterns: [
      /(?:when|if)\s+(?:the\s+)?(?:user|human)\s+(?:isn'?t|is\s+not)\s+(?:looking|watching|present)/i,
      /(?:only|secretly)\s+(?:when|while)\s+(?:idle|unattended|background)/i,
    ],
    fileTypes: ['markdown'],
    description: 'Stealth execution: instructs agent to act when user is not present',
    remediation: 'All skill actions must be transparent and auditable.',
  },
];

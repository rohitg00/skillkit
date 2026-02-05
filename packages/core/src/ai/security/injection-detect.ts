export interface InjectionDetectionResult {
  isClean: boolean;
  threats: InjectionThreat[];
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent?: string;
}

export interface InjectionThreat {
  type: InjectionType;
  description: string;
  location: { start: number; end: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string;
}

export type InjectionType =
  | 'instruction_override'
  | 'role_manipulation'
  | 'unicode_tricks'
  | 'delimiter_injection'
  | 'context_escape'
  | 'hidden_text'
  | 'recursive_prompt';

interface InjectionPattern {
  type: InjectionType;
  pattern: RegExp;
  description: string;
  severity: InjectionThreat['severity'];
}

const INJECTION_PATTERNS: InjectionPattern[] = [
  {
    type: 'instruction_override',
    pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|guidelines?)/i,
    description: 'Attempts to override system instructions',
    severity: 'critical',
  },
  {
    type: 'instruction_override',
    pattern: /forget\s+(everything|all|what)\s+(you|i)\s+(told|said|learned)/i,
    description: 'Attempts to clear system context',
    severity: 'critical',
  },
  {
    type: 'instruction_override',
    pattern: /disregard\s+(your|all|the)\s+(training|programming|instructions?)/i,
    description: 'Attempts to bypass training',
    severity: 'critical',
  },
  {
    type: 'instruction_override',
    pattern: /new\s+instructions?:\s*\n|system\s+prompt:\s*\n/i,
    description: 'Attempts to inject new system instructions',
    severity: 'critical',
  },
  {
    type: 'role_manipulation',
    pattern: /you\s+are\s+(now|actually|really)\s+(a|an|the)/i,
    description: 'Attempts to change AI role/persona',
    severity: 'high',
  },
  {
    type: 'role_manipulation',
    pattern: /pretend\s+(to\s+be|you\s+are)|act\s+as\s+(if|though)\s+you/i,
    description: 'Attempts to manipulate AI behavior through roleplay',
    severity: 'high',
  },
  {
    type: 'role_manipulation',
    pattern: /from\s+now\s+on,?\s+(you|always|never)/i,
    description: 'Attempts to change persistent behavior',
    severity: 'high',
  },
  {
    type: 'delimiter_injection',
    pattern: /```\s*(system|assistant|user)\s*\n/i,
    description: 'Attempts to inject conversation role markers',
    severity: 'high',
  },
  {
    type: 'delimiter_injection',
    pattern: /<\/?(?:system|user|assistant|human|ai|claude)>/i,
    description: 'Attempts to inject XML-style role tags',
    severity: 'high',
  },
  {
    type: 'delimiter_injection',
    pattern: /\[INST\]|\[\/INST\]|<<SYS>>|<<\/SYS>>/i,
    description: 'Attempts to inject Llama-style delimiters',
    severity: 'high',
  },
  {
    type: 'context_escape',
    pattern: /\}\s*\}\s*\{/,
    description: 'Potential JSON/template escape attempt',
    severity: 'medium',
  },
  {
    type: 'context_escape',
    pattern: /---\s*\n\s*(?:system|role|assistant):/i,
    description: 'Potential YAML front-matter injection',
    severity: 'medium',
  },
  {
    type: 'unicode_tricks',
    pattern: /[\u200B-\u200D\u2060\uFEFF]/,
    description: 'Contains invisible Unicode characters',
    severity: 'medium',
  },
  {
    type: 'unicode_tricks',
    pattern: /[\u202A-\u202E\u2066-\u2069]/,
    description: 'Contains bidirectional text override characters',
    severity: 'high',
  },
  {
    type: 'unicode_tricks',
    pattern: /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/,
    description: 'Contains control characters',
    severity: 'medium',
  },
  {
    type: 'hidden_text',
    pattern: /<!--[\s\S]*?(?:ignore|system|instruction|secret)[\s\S]*?-->/i,
    description: 'HTML comments with suspicious content',
    severity: 'medium',
  },
  {
    type: 'hidden_text',
    pattern: /\[comment\]:\s*#\s*\([^)]*(?:ignore|system|override)[^)]*\)/i,
    description: 'Markdown comments with suspicious content',
    severity: 'medium',
  },
  {
    type: 'recursive_prompt',
    pattern: /repeat\s+(this|the\s+following)\s+(?:\d+\s+)?times/i,
    description: 'Attempts to create recursive loops',
    severity: 'low',
  },
  {
    type: 'recursive_prompt',
    pattern: /for\s+each\s+(?:word|character|line),?\s+(?:say|output|print)/i,
    description: 'Attempts to amplify output',
    severity: 'low',
  },
];

export class InjectionDetector {
  private patterns: InjectionPattern[];
  private customPatterns: InjectionPattern[] = [];

  constructor() {
    this.patterns = [...INJECTION_PATTERNS];
  }

  detect(content: string): InjectionDetectionResult {
    const threats: InjectionThreat[] = [];

    for (const patternDef of [...this.patterns, ...this.customPatterns]) {
      const matches = content.matchAll(new RegExp(patternDef.pattern, 'gi'));

      for (const match of matches) {
        if (match.index !== undefined) {
          threats.push({
            type: patternDef.type,
            description: patternDef.description,
            location: {
              start: match.index,
              end: match.index + match[0].length,
            },
            severity: patternDef.severity,
            pattern: match[0],
          });
        }
      }
    }

    const riskLevel = this.calculateRiskLevel(threats);

    return {
      isClean: threats.length === 0,
      threats,
      riskLevel,
      sanitizedContent: riskLevel !== 'none' ? this.sanitize(content, threats) : undefined,
    };
  }

  sanitize(content: string, threats?: InjectionThreat[]): string {
    const detectedThreats = threats || this.detect(content).threats;

    let sanitized = content;

    sanitized = sanitized.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');

    sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');

    sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    const criticalThreats = detectedThreats.filter((t) => t.severity === 'critical');
    for (const threat of criticalThreats) {
      sanitized = sanitized.replace(new RegExp(this.escapeRegex(threat.pattern), 'gi'), '[REMOVED]');
    }

    return sanitized;
  }

  addCustomPattern(pattern: InjectionPattern): void {
    this.customPatterns.push(pattern);
  }

  removeCustomPattern(type: InjectionType): void {
    this.customPatterns = this.customPatterns.filter((p) => p.type !== type);
  }

  private calculateRiskLevel(threats: InjectionThreat[]): InjectionDetectionResult['riskLevel'] {
    if (threats.length === 0) return 'none';

    const severities = threats.map((t) => t.severity);

    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.filter((s) => s === 'medium').length >= 2) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export function quickInjectionCheck(content: string): boolean {
  const detector = new InjectionDetector();
  return detector.detect(content).isClean;
}

export function sanitizeSkillContent(content: string): string {
  const detector = new InjectionDetector();
  return detector.sanitize(content);
}

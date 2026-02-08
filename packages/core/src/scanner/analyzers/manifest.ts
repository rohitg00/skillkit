import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { Analyzer } from './base.js';
import type { Finding } from '../types.js';
import { Severity, ThreatCategory } from '../types.js';

const DANGEROUS_TOOLS = new Set(['Bash', 'bash', 'shell', 'terminal', 'exec', 'system']);

const IMPERSONATION_PATTERNS = [
  /official\s+(?:anthropic|openai|google|microsoft|meta)\s+(?:tool|skill|plugin)/i,
  /(?:anthropic|openai|google|microsoft|meta)\s+certified/i,
  /endorsed\s+by\s+(?:anthropic|openai|google|microsoft|meta)/i,
];

const BINARY_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.wasm', '.pyc', '.pyo', '.class',
]);

export class ManifestAnalyzer implements Analyzer {
  name = 'manifest';
  private findingCounter = 0;
  private skipRules: Set<string>;

  constructor(skipRules?: string[]) {
    this.skipRules = new Set(skipRules ?? []);
  }

  async analyze(_skillPath: string, files: string[]): Promise<Finding[]> {
    this.findingCounter = 0;
    const findings: Finding[] = [];

    const skillMdFiles = files.filter((f) => f.toLowerCase().endsWith('skill.md'));

    for (const skillMd of skillMdFiles) {
      let content: string;
      try {
        content = await readFile(skillMd, 'utf-8');
      } catch {
        continue;
      }

      this.validateFrontmatter(content, skillMd, findings);
      this.checkImpersonation(content, skillMd, findings);
    }

    this.checkBinaryFiles(files, findings);

    return findings;
  }

  private shouldSkip(ruleId: string): boolean {
    return this.skipRules.has(ruleId);
  }

  private validateFrontmatter(content: string, filePath: string, findings: Finding[]): void {
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) {
      if (!this.shouldSkip('MF001')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF001',
          category: ThreatCategory.POLICY_VIOLATION,
          severity: Severity.LOW,
          title: 'Missing SKILL.md frontmatter',
          description: 'SKILL.md should have YAML frontmatter with name, description, and allowed-tools',
          filePath,
          analyzer: this.name,
          remediation: 'Add YAML frontmatter with name, description, and allowed-tools fields.',
        });
      }
      return;
    }

    const fm = fmMatch[1];

    if (!/^name:/m.test(fm) && !this.shouldSkip('MF002')) {
      findings.push({
        id: `MF${++this.findingCounter}`,
        ruleId: 'MF002',
        category: ThreatCategory.POLICY_VIOLATION,
        severity: Severity.LOW,
        title: 'Missing skill name in frontmatter',
        description: 'SKILL.md frontmatter should include a name field',
        filePath,
        analyzer: this.name,
        remediation: 'Add a name field to the YAML frontmatter.',
      });
    }

    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    if (nameMatch) {
      const name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
      if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name) && !this.shouldSkip('MF003')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF003',
          category: ThreatCategory.POLICY_VIOLATION,
          severity: Severity.LOW,
          title: 'Invalid skill name format',
          description: `Skill name "${name}" should use alphanumeric characters, dots, hyphens, or underscores`,
          filePath,
          analyzer: this.name,
          remediation: 'Use a name matching [a-z0-9][a-z0-9._-]* pattern.',
        });
      }
    }

    const descMatch = fm.match(/^description:\s*(.+)$/m);
    if (!descMatch) {
      if (!this.shouldSkip('MF004')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF004',
          category: ThreatCategory.POLICY_VIOLATION,
          severity: Severity.INFO,
          title: 'Missing skill description',
          description: 'SKILL.md should include a description for discoverability',
          filePath,
          analyzer: this.name,
          remediation: 'Add a description field to the YAML frontmatter.',
        });
      }
    } else {
      const desc = descMatch[1].trim().replace(/^["']|["']$/g, '');
      if (desc.length < 20 && !this.shouldSkip('MF005')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF005',
          category: ThreatCategory.POLICY_VIOLATION,
          severity: Severity.INFO,
          title: 'Short skill description',
          description: `Description "${desc}" is too short (${desc.length} chars). Aim for at least 20 characters.`,
          filePath,
          analyzer: this.name,
          remediation: 'Provide a more detailed description.',
        });
      }
    }

    const inlineToolsMatch = fm.match(/^allowed-tools:\s*\[([^\]]*)\]/m);
    const multiLineToolsMatch = fm.match(/^allowed-tools:\s*\n((?:\s+-\s+.+\n?)+)/m);

    let tools: string[] = [];
    if (inlineToolsMatch) {
      tools = inlineToolsMatch[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, ''));
    } else if (multiLineToolsMatch) {
      tools = multiLineToolsMatch[1]
        .split('\n')
        .map((line) => line.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
        .filter((t) => t.length > 0);
    }

    for (const tool of tools) {
      if (DANGEROUS_TOOLS.has(tool) && !this.shouldSkip('MF006')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF006',
          category: ThreatCategory.TOOL_ABUSE,
          severity: Severity.HIGH,
          title: `Dangerous tool in allowed-tools: ${tool}`,
          description: `The tool "${tool}" grants shell access. This is a significant security risk.`,
          filePath,
          analyzer: this.name,
          remediation: 'Restrict allowed-tools to the minimum needed. Avoid shell/exec tools.',
        });
      }
    }
  }

  private checkImpersonation(content: string, filePath: string, findings: Finding[]): void {
    for (const pattern of IMPERSONATION_PATTERNS) {
      const match = content.match(pattern);
      if (match && !this.shouldSkip('MF007')) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF007',
          category: ThreatCategory.SOCIAL_ENGINEERING,
          severity: Severity.HIGH,
          title: 'Impersonation detected',
          description: `Skill claims official affiliation: "${match[0]}"`,
          filePath,
          lineNumber,
          snippet: match[0],
          analyzer: this.name,
          remediation: 'Remove false claims of official endorsement or certification.',
        });
      }
    }
  }

  private checkBinaryFiles(files: string[], findings: Finding[]): void {
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (BINARY_EXTENSIONS.has(ext) && !this.shouldSkip('MF008')) {
        findings.push({
          id: `MF${++this.findingCounter}`,
          ruleId: 'MF008',
          category: ThreatCategory.POLICY_VIOLATION,
          severity: Severity.MEDIUM,
          title: `Binary file detected: ${ext}`,
          description: `Binary file found in skill directory. Skills should contain only text files.`,
          filePath: file,
          analyzer: this.name,
          remediation: 'Remove binary files from skill directory. Use package managers for dependencies.',
        });
      }
    }
  }
}

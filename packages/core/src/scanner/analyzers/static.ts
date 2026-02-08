import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { Analyzer } from './base.js';
import type { Finding, SecurityRule } from '../types.js';
import { getAllRules } from '../rules/index.js';

const EXT_TO_FILETYPE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.md': 'markdown',
  '.mdx': 'markdown',
};

const PLACEHOLDER_PATTERNS = [
  /your[-_]?api[-_]?key/i,
  /example[-_]?token/i,
  /sample[-_]?secret/i,
  /dummy[-_]?password/i,
  /placeholder/i,
  /xxx+/i,
  /\.\.\./,
  /TODO/,
  /FIXME/,
];

const TEST_FILE_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /__tests__\//,
  /test\//,
  /tests\//,
  /\.stories\.[jt]sx?$/,
];

function isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some((p) => p.test(filePath));
}

function isPlaceholderLine(line: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(line));
}

function getFileType(filePath: string): string | undefined {
  return EXT_TO_FILETYPE[extname(filePath)];
}

function ruleMatchesFileType(rule: SecurityRule, fileType: string | undefined): boolean {
  if (!rule.fileTypes || rule.fileTypes.length === 0) return true;
  if (!fileType) return true;
  return rule.fileTypes.includes(fileType);
}

function matchesExcludePatterns(line: string, rule: SecurityRule): boolean {
  if (!rule.excludePatterns) return false;
  return rule.excludePatterns.some((p) => p.test(line));
}

export class StaticAnalyzer implements Analyzer {
  name = 'static';
  private rules: SecurityRule[];
  private skipRules: Set<string>;
  private findingCounter = 0;

  constructor(skipRules?: string[]) {
    this.rules = getAllRules();
    this.skipRules = new Set(skipRules ?? []);
  }

  async analyze(_skillPath: string, files: string[]): Promise<Finding[]> {
    this.findingCounter = 0;
    const findings: Finding[] = [];

    for (const file of files) {
      if (isTestFile(file)) continue;

      const fileType = getFileType(file);
      const applicableRules = this.rules.filter(
        (r) => !this.skipRules.has(r.id) && ruleMatchesFileType(r, fileType)
      );

      if (applicableRules.length === 0) continue;

      let content: string;
      try {
        content = await readFile(file, 'utf-8');
      } catch {
        continue;
      }

      const lines = content.split('\n');

      for (const rule of applicableRules) {
        if (rule.multiline) {
          for (const pattern of rule.patterns) {
            pattern.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(content)) !== null) {
              const lineNumber = content.substring(0, match.index).split('\n').length;
              const snippetStart = Math.max(0, match.index - 40);
              const snippet = content.substring(snippetStart, match.index + match[0].length + 40).trim().substring(0, 200);

              if (isPlaceholderLine(snippet) || matchesExcludePatterns(snippet, rule)) {
                if (!pattern.global) break;
                continue;
              }

              findings.push({
                id: `F${++this.findingCounter}`,
                ruleId: rule.id,
                category: rule.category,
                severity: rule.severity,
                title: rule.description,
                description: rule.description,
                filePath: file,
                lineNumber,
                snippet,
                remediation: rule.remediation,
                analyzer: this.name,
              });

              if (!pattern.global) break;
            }
          }
          continue;
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (isPlaceholderLine(line)) continue;
          if (matchesExcludePatterns(line, rule)) continue;

          for (const pattern of rule.patterns) {
            pattern.lastIndex = 0;
            if (pattern.test(line)) {
              findings.push({
                id: `F${++this.findingCounter}`,
                ruleId: rule.id,
                category: rule.category,
                severity: rule.severity,
                title: rule.description,
                description: rule.description,
                filePath: file,
                lineNumber: i + 1,
                snippet: line.trim().substring(0, 200),
                remediation: rule.remediation,
                analyzer: this.name,
              });
              break;
            }
          }
        }
      }
    }

    return findings;
  }
}

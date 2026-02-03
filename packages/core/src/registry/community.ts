import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExternalRegistry, ExternalSkill } from './index.js';

interface ParsedEntry {
  name: string;
  url: string;
  description: string;
  category: string;
}

export class CommunityRegistry implements ExternalRegistry {
  name = 'community';
  private entries: ParsedEntry[] = [];
  private loaded = false;

  constructor(private skillsMdPath?: string) {}

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;

    const paths = this.skillsMdPath
      ? [this.skillsMdPath]
      : [
          join(process.cwd(), 'registry', 'SKILLS.md'),
          join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'registry', 'SKILLS.md'),
        ];

    for (const path of paths) {
      if (!existsSync(path)) continue;
      try {
        const content = readFileSync(path, 'utf-8');
        this.entries = this.parse(content);
        return;
      } catch {
        continue;
      }
    }
  }

  private parse(content: string): ParsedEntry[] {
    const results: ParsedEntry[] = [];
    let currentCategory = '';

    for (const line of content.split('\n')) {
      const headerMatch = line.match(/^##\s+(.+)/);
      if (headerMatch) {
        currentCategory = headerMatch[1].trim();
        continue;
      }

      const entryMatch = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)/);
      if (entryMatch) {
        results.push({
          name: entryMatch[1].trim(),
          url: entryMatch[2].trim(),
          description: entryMatch[3].trim(),
          category: currentCategory,
        });
      }
    }

    return results;
  }

  async search(query: string, options?: { limit?: number }): Promise<ExternalSkill[]> {
    this.load();
    const limit = options?.limit ?? 20;
    const q = query.toLowerCase();

    const matched = this.entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );

    return matched.slice(0, limit).map((e) => ({
      name: e.name,
      description: e.description,
      source: e.url,
      registry: this.name,
    }));
  }

  getAll(): ParsedEntry[] {
    this.load();
    return [...this.entries];
  }

  getCategories(): string[] {
    this.load();
    return [...new Set(this.entries.map((e) => e.category))];
  }
}

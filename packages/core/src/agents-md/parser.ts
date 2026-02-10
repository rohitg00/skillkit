import type { AgentsMdSection } from './types.js';

const MANAGED_START = '<!-- skillkit:managed:start -->';
const MANAGED_END = '<!-- skillkit:managed:end -->';

export class AgentsMdParser {
  parse(content: string): AgentsMdSection[] {
    const sections: AgentsMdSection[] = [];
    const lines = content.split('\n');

    let inManaged = false;
    let currentSection: { id: string; title: string; lines: string[]; managed: boolean } | null = null;

    for (const line of lines) {
      if (line.trim() === MANAGED_START) {
        inManaged = true;
        continue;
      }

      if (line.trim() === MANAGED_END) {
        if (currentSection) {
          sections.push({
            id: currentSection.id,
            title: currentSection.title,
            content: currentSection.lines.join('\n').trim(),
            managed: currentSection.managed,
          });
          currentSection = null;
        }
        inManaged = false;
        continue;
      }

      const headingMatch = line.match(/^##\s+(.+)$/);
      if (headingMatch) {
        if (currentSection) {
          sections.push({
            id: currentSection.id,
            title: currentSection.title,
            content: currentSection.lines.join('\n').trim(),
            managed: currentSection.managed,
          });
        }
        const title = headingMatch[1];
        currentSection = {
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          title,
          lines: [],
          managed: inManaged,
        };
        continue;
      }

      if (currentSection) {
        currentSection.lines.push(line);
      }
    }

    if (currentSection) {
      sections.push({
        id: currentSection.id,
        title: currentSection.title,
        content: currentSection.lines.join('\n').trim(),
        managed: currentSection.managed,
      });
    }

    return sections;
  }

  hasManagedSections(content: string): boolean {
    return content.includes(MANAGED_START) && content.includes(MANAGED_END);
  }

  updateManagedSections(existing: string, newManaged: AgentsMdSection[]): string {
    if (!this.hasManagedSections(existing)) {
      return existing;
    }

    const startIdx = existing.indexOf(MANAGED_START);
    const endIdx = existing.indexOf(MANAGED_END);
    if (startIdx >= endIdx) {
      return existing;
    }

    const managedBlock = this.buildManagedBlock(newManaged);
    const before = existing.substring(0, startIdx);
    const after = existing.substring(endIdx + MANAGED_END.length);

    return `${before}${managedBlock}${after}`;
  }

  private buildManagedBlock(sections: AgentsMdSection[]): string {
    const lines: string[] = [MANAGED_START];
    for (const section of sections) {
      lines.push(`## ${section.title}`);
      lines.push(section.content);
      lines.push('');
    }
    lines.push(MANAGED_END);
    return lines.join('\n');
  }
}

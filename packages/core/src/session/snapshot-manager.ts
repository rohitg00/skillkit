import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { SessionState, SessionSnapshot } from './types.js';

const SAFE_NAME_RE = /^[a-zA-Z0-9_-]+$/;

export class SnapshotManager {
  private readonly snapshotsDir: string;

  constructor(projectPath: string) {
    this.snapshotsDir = join(projectPath, '.skillkit', 'snapshots');
  }

  private ensureDir(): void {
    if (!existsSync(this.snapshotsDir)) {
      mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }

  private sanitizeName(name: string): string {
    if (!name || !SAFE_NAME_RE.test(name)) {
      throw new Error(`Invalid snapshot name: "${name}". Use only letters, numbers, hyphens, and underscores.`);
    }
    return name;
  }

  private getPath(name: string): string {
    const safe = this.sanitizeName(name);
    return join(this.snapshotsDir, `${safe}.yaml`);
  }

  save(
    name: string,
    sessionState: SessionState,
    observations: SessionSnapshot['observations'],
    description?: string
  ): void {
    this.ensureDir();

    const snapshot: SessionSnapshot = {
      version: 1,
      name,
      createdAt: new Date().toISOString(),
      description,
      sessionState,
      observations,
    };

    writeFileSync(this.getPath(name), stringify(snapshot));
  }

  restore(name: string): {
    sessionState: SessionState;
    observations: SessionSnapshot['observations'];
  } {
    const filepath = this.getPath(name);
    if (!existsSync(filepath)) {
      throw new Error(`Snapshot "${name}" not found`);
    }

    let snapshot: SessionSnapshot;
    try {
      const content = readFileSync(filepath, 'utf-8');
      snapshot = parse(content) as SessionSnapshot;
    } catch (err) {
      throw new Error(`Failed to read snapshot "${name}": ${err instanceof Error ? err.message : 'unknown error'}`);
    }

    if (!snapshot.sessionState || !snapshot.observations) {
      throw new Error(`Snapshot "${name}" is corrupted or invalid`);
    }

    return {
      sessionState: snapshot.sessionState,
      observations: snapshot.observations,
    };
  }

  list(): Array<{
    name: string;
    createdAt: string;
    description?: string;
    skillCount: number;
  }> {
    if (!existsSync(this.snapshotsDir)) {
      return [];
    }

    const files = readdirSync(this.snapshotsDir).filter((f) =>
      f.endsWith('.yaml')
    );

    return files
      .map((f) => {
        try {
          const content = readFileSync(join(this.snapshotsDir, f), 'utf-8');
          const snapshot = parse(content) as SessionSnapshot;
          if (!snapshot.createdAt) {
            return null;
          }
          const skillCount = snapshot.sessionState?.history?.length ?? 0;
          return {
            name: snapshot.name ?? f.replace(/\.yaml$/, ''),
            createdAt: snapshot.createdAt,
            description: snapshot.description,
            skillCount,
          };
        } catch {
          return null;
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });
  }

  get(name: string): SessionSnapshot | undefined {
    const filepath = this.getPath(name);
    if (!existsSync(filepath)) {
      return undefined;
    }

    try {
      const content = readFileSync(filepath, 'utf-8');
      return parse(content) as SessionSnapshot;
    } catch {
      return undefined;
    }
  }

  delete(name: string): boolean {
    const filepath = this.getPath(name);
    if (!existsSync(filepath)) {
      return false;
    }
    unlinkSync(filepath);
    return true;
  }

  exists(name: string): boolean {
    return existsSync(this.getPath(name));
  }
}

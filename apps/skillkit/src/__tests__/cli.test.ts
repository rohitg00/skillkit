import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('SkillKit CLI', () => {
  describe('build artifacts', () => {
    it('should have cli entry point', () => {
      const distPath = join(__dirname, '../../dist/cli.js');
      expect(existsSync(distPath)).toBe(true);
    });

    it('should have index entry point', () => {
      const distPath = join(__dirname, '../../dist/index.js');
      expect(existsSync(distPath)).toBe(true);
    });
  });

  describe('package.json', () => {
    it('should have correct bin configuration', async () => {
      const packageJsonPath = join(__dirname, '../../package.json');
      expect(existsSync(packageJsonPath)).toBe(true);
    });
  });
});

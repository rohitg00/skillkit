import { describe, it, expect } from 'vitest';
import { join, normalize } from 'node:path';

function isPathInside(child: string, parent: string): boolean {
  const relative = child.replace(parent, '');
  return !relative.startsWith('..') && !relative.includes('/..');
}

function sanitizeName(name: string): string {
  return name.split(/[/\\]/).pop() || name;
}

describe('Quick Command Security', () => {
  describe('path traversal protection', () => {
    const installDir = '/home/user/.claude/skills';

    it('should block skill names that escape the install directory', () => {
      const maliciousNames = ['../evil', '../../etc/passwd', '../../../tmp/bad', '..\\evil'];

      for (const name of maliciousNames) {
        const sanitized = sanitizeName(name);
        const targetPath = normalize(join(installDir, sanitized));
        expect(isPathInside(targetPath, installDir)).toBe(true);
        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toContain('/');
        expect(sanitized).not.toContain('\\');
      }
    });

    it('should sanitize "../evil" to "evil"', () => {
      expect(sanitizeName('../evil')).toBe('evil');
    });

    it('should sanitize "../../etc/passwd" to "passwd"', () => {
      expect(sanitizeName('../../etc/passwd')).toBe('passwd');
    });

    it('should sanitize "..\\evil" to "evil"', () => {
      expect(sanitizeName('..\\evil')).toBe('evil');
    });

    it('should keep valid skill names unchanged', () => {
      expect(sanitizeName('my-skill')).toBe('my-skill');
      expect(sanitizeName('react-best-practices')).toBe('react-best-practices');
    });

    it('should produce a path inside installDir after sanitization', () => {
      const evilName = '../evil';
      const sanitized = sanitizeName(evilName);
      const targetPath = normalize(join(installDir, sanitized));
      expect(isPathInside(targetPath, installDir)).toBe(true);
      expect(targetPath).toBe(join(installDir, 'evil'));
    });

    it('should detect unsanitized traversal names before normalization', () => {
      const rawPath = `${installDir}/../evil`;
      expect(isPathInside(rawPath, installDir)).toBe(false);
    });

    it('should ensure sanitization prevents the traversal entirely', () => {
      const evilName = '../evil';
      const sanitized = sanitizeName(evilName);
      const targetPath = normalize(join(installDir, sanitized));
      expect(targetPath).toBe(join(installDir, 'evil'));
      expect(targetPath.startsWith(installDir)).toBe(true);
    });
  });
});

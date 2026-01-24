import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AuditLogger } from '../logger.js';

describe('AuditLogger', () => {
  let logger: AuditLogger;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `skillkit-audit-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    logger = new AuditLogger(tempDir);
  });

  afterEach(async () => {
    await logger.destroy();
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('log', () => {
    it('should log an event', async () => {
      await logger.log(
        'skill.install',
        'install',
        'test-skill',
        { source: 'github' },
        true
      );

      await logger.flush();

      const events = await logger.query();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('skill.install');
      expect(events[0].action).toBe('install');
      expect(events[0].resource).toBe('test-skill');
      expect(events[0].success).toBe(true);
    });

    it('should log failure event', async () => {
      await logger.log(
        'skill.install',
        'install',
        'test-skill',
        {},
        false,
        'Network error'
      );

      await logger.flush();

      const events = await logger.query();
      expect(events[0].success).toBe(false);
      expect(events[0].error).toBe('Network error');
    });

    it('should log event with duration', async () => {
      await logger.log(
        'skill.execute',
        'execute',
        'test-skill',
        {},
        true,
        undefined,
        1234
      );

      await logger.flush();

      const events = await logger.query();
      expect(events[0].duration).toBe(1234);
    });

    it('should auto-flush when buffer reaches limit', async () => {
      for (let i = 0; i < 15; i++) {
        await logger.log(
          'skill.sync',
          'sync',
          `skill-${i}`,
          {},
          true
        );
      }

      const events = await logger.query();
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await logger.log('skill.install', 'install', 'skill-1', {}, true);
      await logger.log('skill.uninstall', 'uninstall', 'skill-2', {}, true);
      await logger.log('team.create', 'create', 'team-1', {}, true);
      await logger.log('skill.install', 'install', 'skill-3', {}, false, 'Error');
      await logger.flush();
    });

    it('should query all events', async () => {
      const events = await logger.query();
      expect(events.length).toBe(4);
    });

    it('should filter by type', async () => {
      const events = await logger.query({
        types: ['skill.install'],
      });

      expect(events.length).toBe(2);
      events.forEach((e) => {
        expect(e.type).toBe('skill.install');
      });
    });

    it('should filter by success', async () => {
      const events = await logger.query({
        success: true,
      });

      expect(events.length).toBe(3);
      events.forEach((e) => {
        expect(e.success).toBe(true);
      });
    });

    it('should filter by resource', async () => {
      const events = await logger.query({
        resource: 'skill-1',
      });

      expect(events.length).toBe(1);
      expect(events[0].resource).toBe('skill-1');
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 1000);
      const endDate = new Date(Date.now() + 1000);

      const events = await logger.query({
        startDate,
        endDate,
      });

      expect(events.length).toBe(4);
    });

    it('should respect limit', async () => {
      const events = await logger.query({
        limit: 2,
      });

      expect(events.length).toBe(2);
    });

    it('should respect offset', async () => {
      const events = await logger.query({
        offset: 2,
      });

      expect(events.length).toBe(2);
    });
  });

  describe('stats', () => {
    beforeEach(async () => {
      await logger.log('skill.install', 'install', 'skill-1', {}, true);
      await logger.log('skill.install', 'install', 'skill-2', {}, true);
      await logger.log('skill.install', 'install', 'skill-3', {}, false, 'Error');
      await logger.log('team.create', 'create', 'team-1', {}, true);
      await logger.flush();
    });

    it('should calculate stats', async () => {
      const stats = await logger.stats();

      expect(stats.totalEvents).toBe(4);
      expect(stats.successRate).toBe(0.75); // 3 out of 4
      expect(stats.eventsByType['skill.install']).toBe(3);
      expect(stats.eventsByType['team.create']).toBe(1);
    });

    it('should include recent errors', async () => {
      const stats = await logger.stats();

      expect(stats.recentErrors.length).toBe(1);
      expect(stats.recentErrors[0].error).toBe('Error');
    });

    it('should include top resources', async () => {
      const stats = await logger.stats();

      expect(stats.topResources.length).toBeGreaterThan(0);
      expect(stats.topResources[0].count).toBeGreaterThan(0);
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      await logger.log('skill.install', 'install', 'skill-1', {}, true);
      await logger.log('team.create', 'create', 'team-1', {}, true);
      await logger.flush();
    });

    it('should export to JSON', async () => {
      const content = await logger.export({ format: 'json' });

      const parsed = JSON.parse(content);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('should export to CSV', async () => {
      const content = await logger.export({ format: 'csv' });

      expect(content).toContain('ID,Timestamp,Type');
      expect(content).toContain('skill.install');
      expect(content).toContain('team.create');
    });

    it('should export to text', async () => {
      const content = await logger.export({ format: 'text' });

      expect(content).toContain('skill.install');
      expect(content).toContain('SUCCESS');
    });

    it('should export with query filter', async () => {
      const content = await logger.export({
        format: 'json',
        query: { types: ['skill.install'] },
      });

      const parsed = JSON.parse(content);
      expect(parsed.length).toBe(1);
      expect(parsed[0].type).toBe('skill.install');
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40);
      const recentDate = new Date();

      await logger.log('skill.install', 'install', 'old-skill', {}, true);
      await logger.flush();

      const events = await logger.query();
      events[0].timestamp = oldDate;

      const logFile = join(tempDir, 'audit.log');
      const content = events.map((e) => JSON.stringify(e)).join('\n');
      await fs.writeFile(logFile, content, 'utf-8');

      await logger.log('skill.install', 'install', 'new-skill', {}, true);
      await logger.flush();
    });

    it('should clear old entries', async () => {
      const cutoffDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
      const cleared = await logger.clear(cutoffDate);

      expect(cleared).toBeGreaterThan(0);

      const events = await logger.query();
      events.forEach((e) => {
        expect(e.timestamp.getTime()).toBeGreaterThanOrEqual(
          cutoffDate.getTime()
        );
      });
    });

    it('should clear all entries when no date provided', async () => {
      const cleared = await logger.clear();

      expect(cleared).toBeGreaterThan(0);

      const events = await logger.query();
      expect(events.length).toBe(0);
    });
  });

  describe('flush', () => {
    it('should persist buffered events', async () => {
      await logger.log('skill.install', 'install', 'skill-1', {}, true);

      // Don't auto-flush
      let events = await logger.query();
      expect(events.length).toBe(0);

      await logger.flush();

      events = await logger.query();
      expect(events.length).toBe(1);
    });

    it('should handle empty buffer', async () => {
      await logger.flush();

      const events = await logger.query();
      expect(events.length).toBe(0);
    });
  });
});

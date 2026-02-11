import { Command, Option } from 'clipanion';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readlinkSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { detectAgent, getAdapter } from '@skillkit/agents';
import { AgentType, findAllSkills, validateSkill, loadConfig, getProjectConfigPath, getGlobalSkillsDir } from '@skillkit/core';
import type { AgentType as AgentTypeT } from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';
import { colors, symbols } from '../onboarding/index.js';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

export class DoctorCommand extends Command {
  static override paths = [['doctor']];

  static override usage = Command.Usage({
    description: 'Diagnose setup issues and check environment health',
    details: `
      Runs a series of checks to verify your SkillKit setup is correct,
      including environment, agent detection, skills health, and configuration.
    `,
    examples: [
      ['Run health checks', '$0 doctor'],
      ['JSON output', '$0 doctor --json'],
      ['Auto-fix issues', '$0 doctor --fix'],
    ],
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  fix = Option.Boolean('--fix', false, {
    description: 'Auto-fix issues where possible',
  });

  async execute(): Promise<number> {
    const results: CheckResult[] = [];

    // --- Environment ---
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (nodeMajor >= 18) {
      results.push({ name: 'Node.js version', status: 'pass', message: `Node.js ${nodeVersion}` });
    } else {
      results.push({ name: 'Node.js version', status: 'fail', message: `Node.js ${nodeVersion} — upgrade to >=18 required` });
    }

    const npmVersion = this.whichVersion('npm');
    if (npmVersion) {
      results.push({ name: 'npm available', status: 'pass', message: `npm v${npmVersion}` });
    } else {
      results.push({ name: 'npm available', status: 'warn', message: 'npm not found' });
    }

    const pnpmVersion = this.whichVersion('pnpm');
    if (pnpmVersion) {
      results.push({ name: 'pnpm available', status: 'pass', message: `pnpm v${pnpmVersion}` });
    }

    const skillkitVersion = this.cli.binaryVersion ?? 'unknown';
    results.push({ name: 'SkillKit version', status: 'pass', message: `skillkit v${skillkitVersion}` });

    // --- Configuration ---
    const configPath = getProjectConfigPath();
    const hasConfig = existsSync(configPath);
    if (hasConfig) {
      try {
        const agent = loadConfig().agent;
        results.push({ name: 'Config file', status: 'pass', message: `skillkit.yaml (agent: ${agent})` });
      } catch {
        results.push({ name: 'Config file', status: 'warn', message: 'skillkit.yaml found but has parse errors' });
      }
    } else {
      results.push({ name: 'Config file', status: 'warn', message: 'No config file (using defaults)' });
    }

    // --- Agent Detection ---
    let detectedAgent: AgentTypeT = 'universal';
    try {
      detectedAgent = await detectAgent();
      results.push({ name: 'Detected agent', status: 'pass', message: `Detected: ${detectedAgent}` });
    } catch {
      results.push({ name: 'Detected agent', status: 'warn', message: 'No agent detected (using universal)' });
    }

    const otherDetected: string[] = [];
    try {
      for (const agentType of AgentType.options) {
        if (agentType === detectedAgent || agentType === 'universal') continue;
        try {
          const agentAdapter = getAdapter(agentType);
          if (await agentAdapter.isDetected()) {
            otherDetected.push(agentType);
          }
        } catch {
          // skip
        }
      }
      if (otherDetected.length > 0) {
        results.push({ name: 'Other agents', status: 'warn', message: `Also detected: ${otherDetected.join(', ')}` });
      }
    } catch {
      // skip
    }

    // --- Skills ---
    const adapter = getAdapter(detectedAgent);
    const skillsDir = resolve(adapter.skillsDir);
    const skillsDirExists = existsSync(skillsDir);

    if (skillsDirExists) {
      const entries = readdirSync(skillsDir).filter(e => !e.startsWith('.'));
      results.push({ name: 'Project skills dir', status: 'pass', message: `${adapter.skillsDir} (${entries.length} entries)` });
    } else {
      if (this.fix) {
        mkdirSync(skillsDir, { recursive: true });
        results.push({ name: 'Project skills dir', status: 'pass', message: `${adapter.skillsDir} (created)` });
      } else {
        results.push({
          name: 'Project skills dir',
          status: 'warn',
          message: `${adapter.skillsDir} missing`,
          fix: 'Run with --fix to create it',
        });
      }
    }

    const globalSkillsDirRaw = getGlobalSkillsDir(detectedAgent);
    const globalSkillsDir = globalSkillsDirRaw ? globalSkillsDirRaw.replace(/^~/, homedir()) : null;
    if (globalSkillsDir && existsSync(globalSkillsDir)) {
      const entries = readdirSync(globalSkillsDir).filter(e => !e.startsWith('.'));
      results.push({ name: 'Global skills dir', status: 'pass', message: `${globalSkillsDir} (${entries.length} entries)` });
    } else {
      results.push({ name: 'Global skills dir', status: 'pass', message: 'No global skills directory' });
    }

    // Skill validation
    let searchDirs: string[] = [];
    try {
      searchDirs = getSearchDirs(detectedAgent);
    } catch {
      searchDirs = skillsDirExists ? [skillsDir] : [];
    }

    const allSkills = findAllSkills(searchDirs);
    const invalidSkills: string[] = [];

    for (const skill of allSkills) {
      const validation = validateSkill(skill.path);
      if (!validation.valid) {
        invalidSkills.push(`${skill.name}: ${validation.errors.join(', ')}`);
      }
    }

    if (allSkills.length === 0) {
      results.push({ name: 'Installed skills', status: 'pass', message: 'No skills installed' });
    } else if (invalidSkills.length === 0) {
      results.push({ name: 'Installed skills', status: 'pass', message: `${allSkills.length} skills, all valid` });
    } else {
      results.push({
        name: 'Installed skills',
        status: 'fail',
        message: `${invalidSkills.length} of ${allSkills.length} skills have errors`,
        fix: invalidSkills.join('; '),
      });
    }

    // Broken symlinks
    const brokenSymlinks: string[] = [];
    for (const dir of searchDirs) {
      if (!existsSync(dir)) continue;
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          try {
            const stat = lstatSync(fullPath);
            if (stat.isSymbolicLink()) {
              const target = readlinkSync(fullPath);
              const resolvedTarget = resolve(dir, target);
              if (!existsSync(resolvedTarget)) {
                brokenSymlinks.push(fullPath);
              }
            }
          } catch {
            // skip
          }
        }
      } catch {
        // skip
      }
    }

    if (brokenSymlinks.length > 0) {
      if (this.fix) {
        let removed = 0;
        const failed: string[] = [];
        for (const link of brokenSymlinks) {
          try {
            unlinkSync(link);
            removed++;
          } catch {
            failed.push(link);
          }
        }
        if (failed.length > 0) {
          results.push({ name: 'Broken symlinks', status: 'warn', message: `Removed ${removed}, failed to remove ${failed.length}` });
        } else {
          results.push({ name: 'Broken symlinks', status: 'pass', message: `Removed ${brokenSymlinks.length} broken symlink(s)` });
        }
      } else {
        results.push({
          name: 'Broken symlinks',
          status: 'fail',
          message: `${brokenSymlinks.length} broken symlink(s) found`,
          fix: brokenSymlinks.map(l => `  ${l}`).join('\n'),
        });
      }
    } else {
      results.push({ name: 'Broken symlinks', status: 'pass', message: 'No broken symlinks' });
    }

    // --- Output ---
    if (this.json) {
      const summary = {
        checks: results,
        passed: results.filter(r => r.status === 'pass').length,
        warnings: results.filter(r => r.status === 'warn').length,
        errors: results.filter(r => r.status === 'fail').length,
      };
      console.log(JSON.stringify(summary, null, 2));
      return summary.errors > 0 ? 1 : 0;
    }

    console.log('');
    console.log(colors.primary('skillkit doctor'));
    console.log('');

    const sections: Record<string, string[]> = {
      Environment: ['Node.js version', 'npm available', 'pnpm available', 'SkillKit version'],
      Configuration: ['Config file', 'Detected agent', 'Other agents'],
      Skills: ['Project skills dir', 'Global skills dir', 'Installed skills', 'Broken symlinks'],
    };

    for (const [section, checkNames] of Object.entries(sections)) {
      const sectionResults = results.filter(r => checkNames.includes(r.name));
      if (sectionResults.length === 0) continue;

      console.log(`  ${colors.primary(section)}`);
      for (const result of sectionResults) {
        const icon = this.statusIcon(result.status);
        console.log(`    ${icon} ${result.message}`);
        if (result.fix && result.status !== 'pass') {
          console.log(`      ${colors.muted(result.fix)}`);
        }
      }
      console.log('');
    }

    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warn').length;
    const errors = results.filter(r => r.status === 'fail').length;

    const parts = [`${passed} passed`];
    if (warnings > 0) parts.push(`${warnings} warning(s)`);
    if (errors > 0) parts.push(`${errors} error(s)`);
    console.log(`  ${colors.muted('Summary:')} ${parts.join(', ')}`);
    console.log('');

    return errors > 0 ? 1 : 0;
  }

  private statusIcon(status: CheckResult['status']): string {
    switch (status) {
      case 'pass': return colors.success(symbols.success);
      case 'warn': return colors.warning(symbols.warning);
      case 'fail': return colors.error(symbols.error);
    }
  }

  private whichVersion(cmd: string): string | null {
    try {
      return execFileSync(cmd, ['--version'], { encoding: 'utf-8', timeout: 5000 })
        .trim()
        .replace(/^v/, '');
    } catch {
      return null;
    }
  }
}

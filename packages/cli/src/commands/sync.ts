import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Command, Option } from 'clipanion';
import { loadConfig, findAllSkills } from '@skillkit/core';
import type { AgentType } from '@skillkit/core';
import { getAdapter, detectAgent, getAllAdapters } from '@skillkit/agents';
import { getSearchDirs, getAgentConfigPath } from '../helpers.js';
import {
  header,
  colors,
  symbols,
  formatAgent,
  isCancel,
  spinner,
  select,
  confirm,
  outro,
  cancel,
  warn,
  showSyncSummary,
} from '../onboarding/index.js';

export class SyncCommand extends Command {
  static override paths = [['sync'], ['s']];

  static override usage = Command.Usage({
    description: 'Sync skills to agent configuration file',
    examples: [
      ['Sync all enabled skills', '$0 sync'],
      ['Sync to specific file', '$0 sync --output AGENTS.md'],
      ['Sync for specific agent', '$0 sync --agent cursor'],
      ['Only sync enabled skills', '$0 sync --enabled-only'],
    ],
  });

  output = Option.String('--output,-o', {
    description: 'Output file path (default: agent-specific config file)',
  });

  agent = Option.String('--agent,-a', {
    description: 'Target agent type (claude-code, cursor, codex, etc.)',
  });

  enabledOnly = Option.Boolean('--enabled-only,-e', true, {
    description: 'Only include enabled skills (default: true)',
  });

  yes = Option.Boolean('--yes,-y', false, {
    description: 'Skip confirmation prompts',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output',
  });

  async execute(): Promise<number> {
    const isInteractive = process.stdin.isTTY && !this.yes;

    if (!this.quiet) {
      header('Sync Skills');
    }

    try {
      let agentType: AgentType;
      const s = spinner();

      if (this.agent) {
        agentType = this.agent as AgentType;
      } else if (isInteractive) {
        // Let user select agent
        s.start('Detecting agent...');
        const config = loadConfig();
        const detected = config.agent || (await detectAgent());
        s.stop(`Detected: ${formatAgent(detected)}`);

        const allAgents = getAllAdapters().map(a => a.type);

        const agentResult = await select({
          message: 'Sync to which agent?',
          options: allAgents.map(a => ({
            value: a,
            label: formatAgent(a),
            hint: a === detected ? '(current)' : undefined,
          })),
          initialValue: detected,
        });

        if (isCancel(agentResult)) {
          cancel('Sync cancelled');
          return 0;
        }

        agentType = agentResult as AgentType;
      } else {
        const config = loadConfig();
        agentType = config.agent || (await detectAgent());
      }

      const adapter = getAdapter(agentType);
      const outputPath = this.output || getAgentConfigPath(agentType);

      const searchDirs = getSearchDirs(agentType);
      let skills = findAllSkills(searchDirs);

      if (this.enabledOnly) {
        skills = skills.filter(s => s.enabled);
      }

      if (skills.length === 0) {
        warn('No skills found to sync');
        console.log(colors.muted('Install skills with: skillkit install <source>'));
        return 0;
      }

      // Show skills to sync
      if (!this.quiet) {
        console.log('');
        console.log(colors.bold(`Syncing ${skills.length} skill(s) for ${adapter.name}:`));
        console.log('');

        for (const skill of skills) {
          const status = skill.enabled ? colors.success(symbols.success) : colors.muted(symbols.stepPending);
          const location = skill.location === 'project'
            ? colors.cyan('[project]')
            : colors.muted('[global]');
          console.log(`  ${status} ${skill.name} ${location}`);
        }
        console.log('');
      }

      // Confirm sync
      if (isInteractive && !this.yes) {
        const confirmResult = await confirm({
          message: `Sync ${skills.length} skill(s) to ${outputPath}?`,
          initialValue: true,
        });

        if (isCancel(confirmResult) || !confirmResult) {
          cancel('Sync cancelled');
          return 0;
        }
      }

      // Generate and write config
      s.start('Generating config...');

      const config = adapter.generateConfig(skills);

      if (!config) {
        s.stop('No configuration generated');
        return 0;
      }

      let existingContent = '';
      if (existsSync(outputPath)) {
        existingContent = readFileSync(outputPath, 'utf-8');
      }

      const newContent = updateConfigContent(existingContent, config, agentType);

      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(outputPath, newContent, 'utf-8');

      s.stop('Config generated');

      // Show summary
      showSyncSummary({
        skillCount: skills.length,
        agentType,
        configPath: outputPath,
      });

      if (!this.quiet) {
        outro('Sync complete!');
      }

      return 0;
    } catch (err) {
      console.log(colors.error('Sync failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }
}

function updateConfigContent(existing: string, newConfig: string, agentType: AgentType): string {
  const markers: Record<string, { start: string; end: string }> = {
    'claude-code': {
      start: '<!-- SKILLS_TABLE_START -->',
      end: '<!-- SKILLS_TABLE_END -->',
    },
    cursor: {
      start: '<!-- SKILLS_DATA_START -->',
      end: '<!-- SKILLS_DATA_END -->',
    },
    universal: {
      start: '<!-- SKILLKIT_SKILLS_START -->',
      end: '<!-- SKILLKIT_SKILLS_END -->',
    },
  };

  const agentMarkers = markers[agentType] || markers.universal;

  const startIdx = existing.indexOf(agentMarkers.start);
  const endIdx = existing.indexOf(agentMarkers.end);

  if (startIdx !== -1 && endIdx !== -1) {
    return (
      existing.slice(0, startIdx) +
      newConfig.slice(newConfig.indexOf(agentMarkers.start)) +
      existing.slice(endIdx + agentMarkers.end.length)
    );
  }

  const genericStart = '<!-- SKILLKIT_SKILLS_START -->';
  const genericEnd = '<!-- SKILLKIT_SKILLS_END -->';
  const gStartIdx = existing.indexOf(genericStart);
  const gEndIdx = existing.indexOf(genericEnd);

  if (gStartIdx !== -1 && gEndIdx !== -1) {
    return (
      existing.slice(0, gStartIdx) + newConfig + existing.slice(gEndIdx + genericEnd.length)
    );
  }

  if (existing.trim()) {
    return existing + '\n\n' + newConfig;
  }

  return newConfig;
}

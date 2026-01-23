import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { loadConfig, findAllSkills } from '@skillkit/core';
import type { AgentType } from '@skillkit/core';
import { getAdapter, detectAgent } from '@skillkit/agents';
import { getSearchDirs, getAgentConfigPath } from '../helpers.js';

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

  async execute(): Promise<number> {
    try {
      let agentType: AgentType;

      if (this.agent) {
        agentType = this.agent as AgentType;
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
        console.log(chalk.yellow('No skills found to sync'));
        console.log(chalk.dim('Install skills with: skillkit install <source>'));
        return 0;
      }

      console.log(chalk.cyan(`Syncing ${skills.length} skill(s) for ${adapter.name}:`));
      skills.forEach(s => {
        const status = s.enabled ? chalk.green('✓') : chalk.dim('○');
        const location = s.location === 'project' ? chalk.blue('[project]') : chalk.dim('[global]');
        console.log(`  ${status} ${s.name} ${location}`);
      });
      console.log();

      const config = adapter.generateConfig(skills);

      if (!config) {
        console.log(chalk.yellow('No configuration generated'));
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

      console.log(chalk.green(`Synced to ${outputPath}`));
      console.log(chalk.dim(`Agent: ${adapter.name}`));

      return 0;
    } catch (error) {
      console.error(chalk.red('Sync failed'));
      console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
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

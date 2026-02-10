import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { ContentExtractor, SkillGenerator, AutoTagger } from '@skillkit/core';
import type { AgentType } from '@skillkit/core';
import { getAdapter } from '@skillkit/agents';
import { spinner } from '../onboarding/index.js';

export class SaveCommand extends Command {
  static override paths = [['save']];

  static override usage = Command.Usage({
    description: 'Save content from a URL, text, or file as a reusable skill',
    examples: [
      ['Save a webpage as a skill', '$0 save https://example.com/guide'],
      ['Save with a custom name', '$0 save https://example.com/guide --name my-guide'],
      ['Save raw text', '$0 save --text "Always use TypeScript strict mode"'],
      ['Save a local file', '$0 save --file ./notes.md'],
      ['Save globally', '$0 save https://example.com/guide --global'],
      ['Save and install to agents', '$0 save https://example.com/guide --agent claude-code,cursor'],
    ],
  });

  url = Option.String({ required: false });

  name = Option.String('--name,-n', {
    description: 'Custom skill name',
  });

  agent = Option.String('--agent,-a', {
    description: 'Comma-separated list of agents to install the skill to',
  });

  global = Option.Boolean('--global,-g', false, {
    description: 'Save to global skills directory',
  });

  text = Option.String('--text,-t', {
    description: 'Raw text to save as a skill',
  });

  file = Option.String('--file,-f', {
    description: 'Local file path to save as a skill',
  });

  async execute(): Promise<number> {
    const sources = [this.url, this.text, this.file].filter(Boolean);
    if (sources.length === 0) {
      console.log(chalk.red('Provide a URL, --text, or --file'));
      return 1;
    }
    if (sources.length > 1) {
      console.log(chalk.red('Provide only one of: URL, --text, or --file'));
      return 1;
    }

    const extractor = new ContentExtractor();
    const generator = new SkillGenerator();
    const tagger = new AutoTagger();

    const s = spinner();

    try {
      s.start('Extracting content');

      let content;
      if (this.url) {
        content = await extractor.extractFromUrl(this.url);
      } else if (this.text) {
        content = extractor.extractFromText(this.text);
      } else {
        content = extractor.extractFromFile(this.file!);
      }

      const tags = tagger.detectTags(content);
      content.tags = tags;

      s.message('Generating skill');

      const result = generator.generate(content, {
        name: this.name,
        global: this.global,
      });

      s.stop(chalk.green('Skill saved'));

      console.log('');
      console.log(chalk.bold('  Name:  ') + chalk.cyan(result.name));
      console.log(chalk.bold('  Path:  ') + chalk.dim(result.skillPath));
      if (tags.length > 0) {
        console.log(chalk.bold('  Tags:  ') + tags.map(t => chalk.yellow(t)).join(', '));
      }

      if (this.agent) {
        const agents = this.agent.split(',').map(a => a.trim()).filter(Boolean);
        const skillDir = dirname(result.skillPath);

        for (const agentName of agents) {
          try {
            const adapter = getAdapter(agentName as AgentType);
            const targetDir = join(adapter.skillsDir, result.name);
            mkdirSync(targetDir, { recursive: true });
            cpSync(skillDir, targetDir, { recursive: true });
            console.log(chalk.green(`  Installed to ${agentName}: `) + chalk.dim(targetDir));
          } catch (err) {
            console.log(chalk.yellow(`  Skipped ${agentName}: ${err instanceof Error ? err.message : String(err)}`));
          }
        }
      }

      console.log('');
      return 0;
    } catch (err) {
      s.stop(chalk.red('Failed'));
      console.log(chalk.red(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }
}

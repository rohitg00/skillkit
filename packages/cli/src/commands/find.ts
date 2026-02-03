import { Command, Option } from 'clipanion';
import {
  colors,
  symbols,
  spinner,
  step,
  isCancel,
  select,
  header,
} from '../onboarding/index.js';
import { FederatedSearch, GitHubSkillRegistry } from '@skillkit/core';

interface SkillResult {
  name: string;
  description?: string;
  source: string;
  repoName: string;
}

import skillsData from '../../../../marketplace/skills.json' with { type: 'json' };
import sourcesData from '../../../../marketplace/sources.json' with { type: 'json' };

export class FindCommand extends Command {
  static override paths = [['find'], ['search']];

  static override usage = Command.Usage({
    description: 'Search for skills in the marketplace',
    details: `
      Quickly find and install skills from the marketplace.
      Interactive mode lets you browse and install in one step.
    `,
    examples: [
      ['Interactive search', '$0 find'],
      ['Search for specific skill', '$0 find pdf'],
      ['Search with keyword', '$0 find "nextjs"'],
      ['List top skills', '$0 find --top'],
    ],
  });

  query = Option.String({ required: false });

  top = Option.Boolean('--top,-t', false, {
    description: 'Show top/featured skills',
  });

  limit = Option.String('--limit,-l', '10', {
    description: 'Maximum results to show',
  });

  install = Option.Boolean('--install,-i', false, {
    description: 'Prompt to install after finding',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output (just list skills)',
  });

  federated = Option.Boolean('--federated,-f', false, {
    description: 'Search external registries (GitHub SKILL.md files)',
  });

  async execute(): Promise<number> {
    const s = spinner();
    const limit = parseInt(this.limit, 10) || 10;

    if (!this.quiet) {
      header('Find Skills');
    }

    const allSkills: SkillResult[] = (skillsData.skills || []).map((skill: { name: string; description?: string; source?: string; repo?: string }) => ({
      name: skill.name,
      description: skill.description,
      source: skill.source || '',
      repoName: skill.repo || skill.source?.split('/').pop() || '',
    }));

    let results: SkillResult[];

    if (this.top) {
      const featured = sourcesData.sources
        .filter((s: { official?: boolean }) => s.official)
        .slice(0, 5);

      results = allSkills
        .filter(skill => featured.some((f: { source: string }) => skill.source.includes(f.source)))
        .slice(0, limit);

      if (!this.quiet) {
        step('Showing featured skills');
      }
    } else if (this.query) {
      const query = this.query.toLowerCase();

      s.start('Searching...');

      results = allSkills.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.source.toLowerCase().includes(query) ||
        skill.repoName.toLowerCase().includes(query)
      ).slice(0, limit);

      s.stop(`Found ${results.length} skill(s)`);
    } else {
      if (!this.quiet) {
        step('Enter a search term or browse featured skills');
      }

      const { text } = await import('../onboarding/prompts.js');

      const searchResult = await text({
        message: 'Search skills',
        placeholder: 'e.g., pdf, nextjs, testing',
      });

      if (isCancel(searchResult)) {
        return 0;
      }

      const query = (searchResult as string).toLowerCase();

      if (query) {
        s.start('Searching...');
        results = allSkills.filter(skill =>
          skill.name.toLowerCase().includes(query) ||
          skill.description?.toLowerCase().includes(query) ||
          skill.source.toLowerCase().includes(query) ||
          skill.repoName.toLowerCase().includes(query)
        ).slice(0, limit);
        s.stop(`Found ${results.length} skill(s)`);
      } else {
        results = allSkills.slice(0, limit);
      }
    }

    if (this.federated && this.query) {
      s.start('Searching external registries...');
      const fedSearch = new FederatedSearch();
      fedSearch.addRegistry(new GitHubSkillRegistry());
      const fedResult = await fedSearch.search(this.query, { limit: parseInt(this.limit, 10) || 10 });
      s.stop(`Found ${fedResult.total} external skill(s) from ${fedResult.registries.join(', ') || 'none'}`);

      if (fedResult.skills.length > 0) {
        console.log('');
        console.log(colors.bold('External Skills (SKILL.md):'));
        for (const skill of fedResult.skills) {
          const stars = typeof skill.stars === 'number' ? colors.muted(` ★${skill.stars}`) : '';
          const desc = skill.description
            ? colors.muted(` - ${skill.description.slice(0, 50)}${skill.description.length > 50 ? '...' : ''}`)
            : '';
          console.log(`  ${colors.cyan(symbols.bullet)} ${colors.primary(skill.name)}${stars}${desc}`);
          if (!this.quiet) {
            console.log(`    ${colors.muted(skill.source)}`);
          }
        }
        console.log('');
      }
    }

    if (results.length === 0) {
      console.log(colors.muted('No skills found matching your search'));
      console.log('');
      console.log(colors.muted('Try:'));
      console.log(colors.muted('  skillkit find --top       # Show featured skills'));
      console.log(colors.muted('  skillkit find -f <query>  # Search external registries'));
      console.log(colors.muted('  skillkit ui               # Browse in TUI'));
      return 0;
    }

    console.log('');

    for (const skill of results) {
      const desc = skill.description
        ? colors.muted(` - ${skill.description.slice(0, 50)}${skill.description.length > 50 ? '...' : ''}`)
        : '';
      console.log(`  ${colors.success(symbols.bullet)} ${colors.primary(skill.name)}${desc}`);
      if (!this.quiet && skill.source) {
        console.log(`    ${colors.muted(skill.source)}`);
      }
    }

    console.log('');
    console.log(colors.muted(`Showing ${results.length} of ${allSkills.length} skills`));
    console.log('');

    if (this.install || (!this.query && !this.top && process.stdin.isTTY)) {
      const installResult = await select({
        message: 'Install a skill?',
        options: [
          { value: 'none', label: 'No, just browsing' },
          ...results.slice(0, 5).map(skill => ({
            value: skill.source,
            label: skill.name,
            hint: skill.repoName,
          })),
        ],
        initialValue: 'none',
      });

      if (!isCancel(installResult) && installResult !== 'none') {
        console.log('');
        console.log(colors.cyan('To install, run:'));
        console.log(`  ${colors.bold(`skillkit install ${installResult}`)}`);
      }
    } else {
      console.log(colors.muted('To install: skillkit install <source>'));
    }

    return 0;
  }
}

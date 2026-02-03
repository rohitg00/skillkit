import { Command, Option } from 'clipanion';
import {
  colors,
  header,
  step,
} from '../onboarding/index.js';

import skillsData from '../../../../marketplace/skills.json' with { type: 'json' };

export class ServeCommand extends Command {
  static override paths = [['serve'], ['server']];

  static override usage = Command.Usage({
    description: 'Start the SkillKit REST API server for skill discovery',
    details: `
      Launches a local HTTP server that exposes the SkillKit skill catalog
      via a REST API. Useful for integrating with other tools, building
      custom UIs, or enabling agent-native skill discovery.
    `,
    examples: [
      ['Start server on default port', '$0 serve'],
      ['Start on custom port', '$0 serve --port 8080'],
      ['Start with custom CORS', '$0 serve --cors "http://localhost:3000"'],
    ],
  });

  port = Option.String('--port,-p', '3737', {
    description: 'Port to listen on',
  });

  host = Option.String('--host,-h', '0.0.0.0', {
    description: 'Host to bind to',
  });

  corsOrigin = Option.String('--cors', '*', {
    description: 'CORS allowed origin',
  });

  cacheTtl = Option.String('--cache-ttl', '86400000', {
    description: 'Cache TTL in milliseconds',
  });

  async execute(): Promise<number> {
    header('SkillKit API Server');

    const skills = (skillsData.skills || []).map((skill: Record<string, unknown>) => ({
      name: skill.name as string,
      description: skill.description as string | undefined,
      source: (skill.source as string) || '',
      repo: skill.repo as string | undefined,
      tags: skill.tags as string[] | undefined,
      category: skill.category as string | undefined,
    }));

    step(`Loading ${skills.length} skills from marketplace`);

    const portNum = parseInt(this.port, 10) || 3737;
    const cacheTtlMs = parseInt(this.cacheTtl, 10) || 86_400_000;

    try {
      const { startServer } = await import('@skillkit/api');

      await startServer({
        port: portNum,
        host: this.host,
        corsOrigin: this.corsOrigin,
        cacheTtlMs,
        skills,
      });

      step(`Server running at ${colors.cyan(`http://${this.host}:${portNum}`)}`);
      console.log('');
      console.log(colors.muted('Endpoints:'));
      console.log(colors.muted(`  GET  /health          - Server health check`));
      console.log(colors.muted(`  GET  /search?q=...    - Search skills`));
      console.log(colors.muted(`  POST /search          - Search with filters`));
      console.log(colors.muted(`  GET  /skills/:src/:id - Get specific skill`));
      console.log(colors.muted(`  GET  /trending        - Top skills`));
      console.log(colors.muted(`  GET  /categories      - Skill categories`));
      console.log(colors.muted(`  GET  /cache/stats     - Cache statistics`));
      console.log('');
      console.log(colors.muted('Press Ctrl+C to stop'));

      await new Promise(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(colors.error(`Failed to start server: ${message}`));
      return 1;
    }

    return 0;
  }
}

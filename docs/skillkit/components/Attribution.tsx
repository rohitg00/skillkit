import React from 'react';

interface SkillSource {
  name: string;
  repo: string;
  description: string;
  official?: boolean;
  license?: string;
  skillCount?: string;
}

const SKILL_SOURCES: SkillSource[] = [
  {
    name: 'Anthropic Official',
    repo: 'anthropics/skills',
    description: 'Official Claude Code skills from Anthropic',
    official: true,
    license: 'Apache 2.0',
    skillCount: '21+',
  },
  {
    name: 'Vercel Labs',
    repo: 'vercel-labs/agent-skills',
    description: 'Next.js, React, and Vercel platform skills',
    official: true,
    license: 'MIT',
    skillCount: '15+',
  },
  {
    name: 'Expo / React Native',
    repo: 'expo/skills',
    description: 'Mobile development with Expo and React Native',
    official: true,
    license: 'MIT',
    skillCount: '12+',
  },
  {
    name: 'Remotion Video',
    repo: 'remotion-dev/skills',
    description: 'Programmatic video creation with React',
    official: true,
    license: 'MIT',
    skillCount: '8+',
  },
  {
    name: 'Supabase',
    repo: 'supabase/agent-skills',
    description: 'Database, auth, and backend skills',
    official: true,
    license: 'Apache 2.0',
    skillCount: '10+',
  },
  {
    name: 'Stripe Payments',
    repo: 'stripe/ai',
    description: 'Payment integration and Stripe API patterns',
    official: true,
    license: 'MIT',
    skillCount: '8+',
  },
  {
    name: 'Trail of Bits Security',
    repo: 'trailofbits/skills',
    description: 'Security analysis, auditing, and vulnerability detection',
    license: 'Apache 2.0',
    skillCount: '25+',
  },
  {
    name: 'Superpowers TDD',
    repo: 'obra/superpowers',
    description: 'Test-driven development and workflow automation by Jesse Obra',
    license: 'MIT',
    skillCount: '14+',
  },
  {
    name: 'Dev Patterns',
    repo: 'wshobson/agents',
    description: 'Development patterns and agent configurations',
    license: 'MIT',
    skillCount: '48+',
  },
  {
    name: 'Composio Awesome',
    repo: 'ComposioHQ/awesome-claude-skills',
    description: 'Curated collection of Claude Code skills',
    license: 'MIT',
  },
  {
    name: 'Travis Awesome',
    repo: 'travisvn/awesome-claude-skills',
    description: 'Community-curated skill collection',
    license: 'MIT',
  },
  {
    name: 'Skills Marketplace',
    repo: 'mhattingpete/claude-skills-marketplace',
    description: 'Community skill marketplace',
    license: 'MIT',
  },
  {
    name: 'Dify Frontend',
    repo: 'langgenius/dify',
    description: 'AI application development platform patterns',
    license: 'Apache 2.0',
  },
  {
    name: 'Better Auth',
    repo: 'better-auth/skills',
    description: 'Authentication and authorization patterns',
    license: 'MIT',
  },
  {
    name: 'Nuxt / Vue',
    repo: 'onmax/nuxt-skills',
    description: 'Vue.js and Nuxt framework skills',
    license: 'MIT',
  },
  {
    name: 'ElysiaJS / Bun',
    repo: 'elysiajs/skills',
    description: 'Bun runtime and ElysiaJS framework',
    license: 'MIT',
  },
  {
    name: 'NestJS',
    repo: 'kadajett/agent-nestjs-skills',
    description: 'NestJS backend framework patterns',
    license: 'MIT',
  },
  {
    name: 'Three.js',
    repo: 'cloudai-x/threejs-skills',
    description: '3D graphics and WebGL development',
    license: 'MIT',
  },
  {
    name: 'SwiftUI iOS',
    repo: 'dimillian/skills',
    description: 'iOS and SwiftUI development patterns',
    license: 'MIT',
  },
  {
    name: 'Convex Backend',
    repo: 'waynesutton/convexskills',
    description: 'Convex backend development',
    license: 'MIT',
  },
  {
    name: 'Obsidian Notes',
    repo: 'kepano/obsidian-skills',
    description: 'Obsidian plugin and vault management',
    license: 'MIT',
  },
  {
    name: 'Shadcn / Radix',
    repo: 'giuseppe-trisciuoglio/developer-kit',
    description: 'UI component libraries and design systems',
    license: 'MIT',
  },
  {
    name: 'OpenRouter SDK',
    repo: 'openrouterteam/agent-skills',
    description: 'OpenRouter API integration patterns',
    license: 'MIT',
  },
  {
    name: 'Context7',
    repo: 'intellectronica/agent-skills',
    description: 'Context management and documentation tools',
    license: 'MIT',
  },
];

export function Attribution(): React.ReactElement {
  const officialSources = SKILL_SOURCES.filter(s => s.official);
  const communitySources = SKILL_SOURCES.filter(s => !s.official);

  return (
    <section className="py-12 border-b border-zinc-800 bg-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 font-mono">Skill Sources</h2>
          <p className="text-zinc-500 font-mono text-[10px] sm:text-xs max-w-2xl mx-auto px-2">
            SkillKit aggregates skills from trusted sources. We credit and link back to all original creators.
            Each source retains its original license.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Official Partner Sources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {officialSources.map(source => (
              <a
                key={source.repo}
                href={`https://github.com/${source.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4 hover:border-blue-800 hover:bg-blue-950/20 transition-all"
              >
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <div className="font-mono text-xs sm:text-sm text-white group-hover:text-blue-400 transition-colors">
                    {source.name}
                  </div>
                  {source.skillCount && (
                    <span className="text-[9px] sm:text-[10px] bg-blue-900/50 text-blue-400 px-1 sm:px-1.5 py-0.5 border border-blue-800/50">
                      {source.skillCount}
                    </span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-600 mb-2 line-clamp-2">{source.description}</div>
                <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-zinc-700">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono truncate">{source.repo}</span>
                  {source.license && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{source.license}</span>
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Community Contributors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {communitySources.map(source => (
              <a
                key={source.repo}
                href={`https://github.com/${source.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-zinc-900/30 border border-zinc-800 p-2 sm:p-3 hover:border-purple-800/50 hover:bg-purple-950/10 transition-all"
              >
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <div className="font-mono text-[10px] sm:text-xs text-white group-hover:text-purple-400 transition-colors truncate">
                    {source.name}
                  </div>
                  {source.skillCount && (
                    <span className="text-[8px] sm:text-[9px] bg-purple-900/30 text-purple-500 px-1 py-0.5 flex-shrink-0 ml-1">
                      {source.skillCount}
                    </span>
                  )}
                </div>
                <div className="text-[9px] sm:text-[10px] text-zinc-600 truncate">{source.repo}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-[10px] sm:text-xs font-mono mb-2 sm:mb-3">
            Want to add your skills to SkillKit?
          </p>
          <a
            href="https://github.com/rohitg00/skillkit/issues/new?template=add-source.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-zinc-900 text-zinc-400 px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your Repository
          </a>
        </div>
      </div>
    </section>
  );
}

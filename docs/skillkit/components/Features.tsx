import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: 'Smart Recommendations',
    description: 'AI analyzes your codebase and recommends from 15,000+ skills.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    title: 'Auto Translation',
    description: 'The npm for agent skills. Write once, auto-translate to 32 formats.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    title: 'Session Memory',
    description: 'AI learnings persist across sessions and projects.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    title: 'Primer',
    description: 'Auto-generate agent instructions for all 32 agents from your codebase.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Skill Tree',
    description: 'Browse 15K+ skills in a hierarchical taxonomy with 12 categories.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  },
  {
    title: 'Workflows',
    description: 'Compose multi-step automated skill sequences.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    title: 'Team Sync',
    description: 'Git-based .skills manifest for consistency.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: 'Testing',
    description: 'Built-in test framework with assertions.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'CI/CD',
    description: 'GitHub Actions, GitLab CI, pre-commit.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    title: 'TS API',
    description: 'Programmatic access for custom tooling.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  }
];

const COMPARISONS = [
  ['Agent Support', '1 agent', '32 agents'],
  ['Setup', 'Write rules manually', 'Auto-generate (Primer)'],
  ['Learning', 'Lost each session', 'Persistent memory'],
  ['Translation', 'Rewrite for each', 'One-click conversion'],
  ['Team Sharing', 'Copy/paste files', '.skills manifest'],
  ['Discovery', 'Search forums', 'AI recommendations'],
] as const;

export function Features(): React.ReactElement {
  return (
    <section id="features" className="py-12 border-b border-zinc-800 bg-surface">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-10">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2 font-mono">Why SkillKit?</h2>
            <p className="text-zinc-500 font-mono text-sm mb-6">
              Universal bridge for AI coding agents.
            </p>
            <div className="flex gap-6 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">32</div>
                <div className="text-zinc-600 text-[10px] sm:text-xs font-mono">Agents</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">50+</div>
                <div className="text-zinc-600 text-[10px] sm:text-xs font-mono">Commands</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">15K+</div>
                <div className="text-zinc-600 text-[10px] sm:text-xs font-mono">Skills</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 border border-zinc-800 bg-black/50 p-4 font-mono text-xs backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-2 border-b border-zinc-800 pb-2 mb-3 text-zinc-500 uppercase tracking-wider text-[10px]">
              <div>Feature</div>
              <div className="text-center">Without</div>
              <div className="text-right">SkillKit</div>
            </div>
            <div className="space-y-1">
              {COMPARISONS.map(([feature, without, withSkillKit], index) => (
                <div
                  key={feature}
                  className="grid grid-cols-3 gap-2 items-center py-1.5 hover:bg-zinc-900/50 transition-colors -mx-2 px-2 rounded"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-zinc-300">{feature}</div>
                  <div className="text-center text-zinc-600">{without}</div>
                  <div className="text-right text-white font-medium">{withSkillKit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/0 to-zinc-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-zinc-500 group-hover:text-white transition-colors mb-2">
                  {feature.icon}
                </div>
                <h4 className="text-xs font-bold text-white mb-1 font-mono">{feature.title}</h4>
                <p className="text-zinc-600 text-[10px] leading-relaxed font-mono group-hover:text-zinc-400 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

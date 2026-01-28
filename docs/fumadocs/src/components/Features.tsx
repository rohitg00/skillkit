import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: 'Multi-Agent',
    description: 'Deploy to 32 AI coding agents with one command.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    title: 'Terminal UI',
    description: 'Beautiful interactive TUI for browsing & installing.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Plugins',
    description: 'Extend with custom plugins & hooks.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Manifest',
    description: '.skills file for team-wide consistency.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'CI/CD',
    description: 'GitHub, GitLab, CircleCI templates included.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    title: 'Slash Commands',
    description: 'Generate /commands for Claude, Cursor & more.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    )
  }
];

const COMPARISONS = [
  ['Agents', '1', '32'],
  ['Translation', 'Manual', 'Auto'],
  ['Sharing', 'Copy/paste', '.skills manifest'],
  ['Discovery', 'Forums', 'CLI + AI'],
  ['CI/CD', 'Custom', 'Templates'],
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
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">40+</div>
                <div className="text-zinc-600 text-[10px] sm:text-xs font-mono">Commands</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">15K</div>
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

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: 'Multi-Agent',
    description: 'Write once, deploy to 17+ AI coding agents automatically.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    title: 'Smart Discovery',
    description: 'AI analyzes your stack and recommends skills.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    title: 'Persistent Memory',
    description: 'Save learnings as reusable skills.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    title: 'Team Sync',
    description: 'Share skills via Git across your team.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: 'Testing',
    description: 'Built-in framework for skill validation.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Workflows',
    description: 'Compose multi-step automated pipelines.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

const COMPARISONS = [
  ['Agents', '1', '17+'],
  ['Translation', 'Manual', 'Auto'],
  ['Sharing', 'Copy/paste', 'Git sync'],
  ['Discovery', 'Forums', 'AI-powered'],
] as const;

export function Features(): React.ReactElement {
  return (
    <section id="features" className="py-12 border-b border-zinc-800 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2 font-mono">Why SkillKit?</h2>
            <p className="text-zinc-500 font-mono text-sm mb-6">
              Universal bridge for AI coding agents.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-white font-mono">17+</div>
                <div className="text-zinc-600 text-xs font-mono">Agents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white font-mono">1</div>
                <div className="text-zinc-600 text-xs font-mono">Command</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white font-mono">∞</div>
                <div className="text-zinc-600 text-xs font-mono">Skills</div>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

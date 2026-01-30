import React from 'react';

interface TeamFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TEAM_FEATURES: TeamFeature[] = [
  {
    title: '.skills Manifest',
    description: 'Define your team\'s skill stack in a single file. Everyone gets the same capabilities.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Git-Based Sync',
    description: 'Skills live in your repo. Push to share. Pull to update. Works with your existing workflow.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
  },
  {
    title: 'CI/CD Integration',
    description: 'Auto-validate and deploy skills on every commit. GitHub Actions, GitLab CI, pre-commit hooks.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Private Registries',
    description: 'Host internal skills in private repos. Control access and maintain proprietary knowledge.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export function TeamEnterprise(): React.ReactElement {
  return (
    <section className="py-12 sm:py-16 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 to-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/80 px-2 sm:px-3 py-1 mb-4 backdrop-blur-sm">
            <span className="text-[10px] sm:text-xs font-mono text-zinc-300 uppercase tracking-wider">For Teams</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-mono tracking-tight">
            Scale Across Your Organization
          </h2>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto">
            From solo developers to enterprise teams. SkillKit grows with you.
          </p>
        </div>

        {/* Team Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {TEAM_FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="group p-4 sm:p-5 border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-300"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-zinc-800/50 border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono mb-1">{feature.title}</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Teaser */}
        <div className="border border-zinc-800 bg-black/30 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mb-1">TypeScript API</h3>
              <p className="text-zinc-500 text-xs sm:text-sm">
                Full programmatic access. Import <code className="text-zinc-400">translateSkill</code>, <code className="text-zinc-400">analyzeProject</code> and more.
              </p>
            </div>
            <a 
              href="https://agenstskills.com/docs/api-reference"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800 text-white font-mono text-xs sm:text-sm hover:bg-zinc-700 transition-colors border border-zinc-700 whitespace-nowrap"
            >
              <span>View API</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 sm:mt-8 text-center">
          <a 
            href="https://agenstskills.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-black font-mono text-xs sm:text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <span>Read the Documentation</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

interface UseCase {
  persona: string;
  problem: string;
  solution: string;
  command: string;
  icon: React.ReactNode;
  gradient: string;
}

const USE_CASES: UseCase[] = [
  {
    persona: 'Multi-Agent Developer',
    problem: 'You\'ve built skills for Claude Code. Now your team wants Cursor, and you want to try Windsurf.',
    solution: 'SkillKit translates skills between all 32 agents. Write once, deploy everywhere.',
    command: 'skillkit translate --to cursor,windsurf',
    gradient: 'from-violet-500/10 to-purple-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    persona: 'Team Lead',
    problem: 'Each developer has different skills. Onboarding takes weeks. Knowledge is scattered.',
    solution: 'Shared .skills manifest ensures everyone has the same capabilities. Git-based sync keeps teams aligned.',
    command: 'skillkit team init && skillkit team share',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    persona: 'New Project Starter',
    problem: 'Configuring AI agents for each new project is tedious. You forget best practices.',
    solution: 'Primer analyzes your codebase and auto-generates optimized instructions for all agents.',
    command: 'skillkit primer --all-agents',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    persona: 'Enterprise Architect',
    problem: 'Running AI agents across multiple machines and keeping them in sync is a nightmare.',
    solution: 'Mesh network with encrypted P2P, peer trust, and inter-agent messaging.',
    command: 'skillkit mesh init && skillkit mesh discover',
    gradient: 'from-orange-500/10 to-amber-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

const WORKFLOW_FEATURES = [
  {
    title: 'Workflow Orchestration',
    description: 'Compose skills into multi-step workflows. Chain operations, handle errors, and automate complex tasks.',
    command: 'skillkit workflow run feature-development',
  },
  {
    title: 'Skill Testing',
    description: 'Built-in test framework with assertions. Validate skills work correctly before deployment.',
    command: 'skillkit test --tags unit,integration',
  },
  {
    title: 'CI/CD Integration',
    description: 'Generate GitHub Actions, GitLab CI, and pre-commit hooks for automated skill management.',
    command: 'skillkit cicd init --provider github',
  },
  {
    title: 'Slash Commands',
    description: 'Auto-generate /commands for Claude, Cursor, and other agents from your skills.',
    command: 'skillkit command generate',
  },
];

export function UseCases(): React.ReactElement {
  return (
    <section className="py-12 sm:py-16 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-mono tracking-tight">
            Built for Real Workflows
          </h2>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto">
            Whether you're a solo developer or managing enterprise infrastructure, 
            SkillKit adapts to your needs.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-12">
          {USE_CASES.map((useCase, index) => (
            <div 
              key={index}
              className={`relative group p-4 sm:p-6 border border-zinc-800 bg-gradient-to-br ${useCase.gradient} hover:border-zinc-700 transition-all duration-300`}
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="p-2 bg-zinc-800/80 border border-zinc-700 text-zinc-300 group-hover:text-white transition-colors flex-shrink-0">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono">{useCase.persona}</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-[10px] sm:text-xs mt-0.5 font-mono flex-shrink-0">PAIN:</span>
                  <p className="text-zinc-400 text-xs sm:text-sm">{useCase.problem}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 text-[10px] sm:text-xs mt-0.5 font-mono flex-shrink-0">FIX:</span>
                  <p className="text-zinc-300 text-xs sm:text-sm">{useCase.solution}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <code className="text-[10px] sm:text-xs font-mono text-zinc-500 bg-black/30 px-2 py-1 block overflow-x-auto whitespace-nowrap">
                  $ {useCase.command}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Features */}
        <div className="border border-zinc-800 bg-black/30 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-mono text-center">
            Developer Tools Built-In
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {WORKFLOW_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-zinc-900/50 transition-colors">
                <span className="text-zinc-500 mt-1 flex-shrink-0">▸</span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white font-mono mb-1">{feature.title}</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-500 mb-2">{feature.description}</p>
                  <code className="text-[9px] sm:text-[10px] font-mono text-zinc-600 break-all">{feature.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

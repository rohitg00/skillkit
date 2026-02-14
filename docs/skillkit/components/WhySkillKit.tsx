import React from 'react';

interface Competitor {
  name: string;
  type: string;
  agents: string;
  translate: boolean;
  memory: boolean;
  security: boolean;
  team: boolean;
  tui: boolean;
  api: boolean;
}

const COMPETITORS: Competitor[] = [
  { name: 'Vercel skills', type: 'Installer', agents: '~17', translate: false, memory: false, security: false, team: false, tui: false, api: false },
  { name: 'PRPM', type: 'Registry', agents: '~6', translate: true, memory: false, security: false, team: false, tui: false, api: false },
  { name: 'Askill', type: 'Installer', agents: '~40', translate: false, memory: false, security: true, team: false, tui: false, api: false },
  { name: 'Skild', type: 'Installer', agents: '~7', translate: false, memory: false, security: false, team: false, tui: false, api: false },
  { name: 'Paks', type: 'Installer', agents: '~6', translate: false, memory: false, security: false, team: false, tui: false, api: false },
  { name: 'SkillKit', type: 'Platform', agents: '44', translate: true, memory: true, security: true, team: true, tui: true, api: true },
];

const SOURCES = [
  { name: 'Anthropic', repo: 'anthropics/skills', official: true },
  { name: 'Vercel', repo: 'vercel-labs/agent-skills', official: true },
  { name: 'Expo', repo: 'expo/skills', official: true },
  { name: 'Supabase', repo: 'supabase/agent-skills', official: true },
  { name: 'Stripe', repo: 'stripe/ai', official: true },
  { name: 'Remotion', repo: 'remotion-dev/skills', official: true },
  { name: 'Trail of Bits', repo: 'trailofbits/skills', official: false },
  { name: 'Better Auth', repo: 'better-auth/skills', official: false },
  { name: 'ElysiaJS', repo: 'elysiajs/skills', official: false },
  { name: 'Nuxt', repo: 'onmax/nuxt-skills', official: false },
  { name: 'NestJS', repo: 'kadajett/agent-nestjs-skills', official: false },
  { name: 'Three.js', repo: 'cloudai-x/threejs-skills', official: false },
];

function Check(): React.ReactElement {
  return <span className="text-green-400 text-xs font-bold">&#10003;</span>;
}

function Cross(): React.ReactElement {
  return <span className="text-zinc-700 text-xs">&#8212;</span>;
}

export function WhySkillKit(): React.ReactElement {
  return (
    <section id="why" className="py-12 sm:py-16 border-b border-zinc-800" style={{ scrollMarginTop: '4rem' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/80 px-2 sm:px-3 py-1 mb-4 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-300 uppercase tracking-wider">Not Another Installer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-mono tracking-tight">
            Others Install. SkillKit Orchestrates.
          </h2>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto">
            Most skill tools are simple installers with 3-5 commands.
            SkillKit is a full platform that aggregates every source, translates to every format,
            and adds memory, security, and team workflows on top.
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-12">
          <div className="min-w-[640px]">
            <table className="w-full border-collapse font-mono text-[10px] sm:text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 uppercase tracking-wider py-2 pr-3">Tool</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">Agents</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">Translate</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">Memory</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">Security</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">Team</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">TUI</th>
                  <th className="px-2 py-2 text-center text-zinc-500 uppercase tracking-wider">API</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c) => {
                  const isSkillKit = c.name === 'SkillKit';
                  const rowClass = isSkillKit
                    ? 'bg-white/[0.03] border-b border-zinc-700'
                    : 'border-b border-zinc-800/50 hover:bg-zinc-900/50';
                  const nameClass = isSkillKit ? 'text-white font-bold' : 'text-zinc-400';
                  return (
                    <tr key={c.name} className={rowClass}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className={nameClass}>{c.name}</span>
                          <span className="text-zinc-700 text-[9px]">{c.type}</span>
                        </div>
                      </td>
                      <td className={`px-2 py-2.5 text-center ${isSkillKit ? 'text-white font-bold' : 'text-zinc-500'}`}>{c.agents}</td>
                      <td className="px-2 py-2.5 text-center">{c.translate ? <Check /> : <Cross />}</td>
                      <td className="px-2 py-2.5 text-center">{c.memory ? <Check /> : <Cross />}</td>
                      <td className="px-2 py-2.5 text-center">{c.security ? <Check /> : <Cross />}</td>
                      <td className="px-2 py-2.5 text-center">{c.team ? <Check /> : <Cross />}</td>
                      <td className="px-2 py-2.5 text-center">{c.tui ? <Check /> : <Cross />}</td>
                      <td className="px-2 py-2.5 text-center">{c.api ? <Check /> : <Cross />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-2 font-mono">
            One CLI. Every Source. Zero Telemetry.
          </h3>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm mb-6">
            SkillKit doesn't compete with skill sources &mdash; it aggregates them.
            Install from 31+ curated repositories, any GitHub/GitLab repo, or local paths.
            Everything runs locally. No accounts, no tracking, no lock-in.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SOURCES.map((s) => (
              <a
                key={s.repo}
                href={`https://github.com/${s.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all"
              >
                <span className="text-zinc-400 group-hover:text-white text-xs font-mono transition-colors">{s.name}</span>
                {s.official && (
                  <span className="text-[8px] text-zinc-600 border border-zinc-800 px-1 py-0.5 uppercase tracking-wider">official</span>
                )}
              </a>
            ))}
            <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-zinc-800 text-zinc-600 text-xs font-mono">
              + 19 more community sources
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 border border-zinc-800 bg-zinc-900/30">
            <div className="text-2xl font-bold text-white font-mono mb-1">0 bytes</div>
            <div className="text-zinc-500 text-xs font-mono">telemetry collected</div>
          </div>
          <div className="p-4 border border-zinc-800 bg-zinc-900/30">
            <div className="text-2xl font-bold text-white font-mono mb-1">Apache 2.0</div>
            <div className="text-zinc-500 text-xs font-mono">fully open source</div>
          </div>
          <div className="p-4 border border-zinc-800 bg-zinc-900/30">
            <div className="text-2xl font-bold text-white font-mono mb-1">No account</div>
            <div className="text-zinc-500 text-xs font-mono">required to use</div>
          </div>
        </div>
      </div>
    </section>
  );
}

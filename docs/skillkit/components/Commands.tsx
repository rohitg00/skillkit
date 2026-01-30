import React, { useState } from 'react';

interface CommandGroup {
  name: string;
  commands: Array<{ cmd: string; desc: string }>;
}

const COMMAND_GROUPS: CommandGroup[] = [
  {
    name: 'Start',
    commands: [
      { cmd: '', desc: 'Launch interactive TUI' },
      { cmd: 'install <repo>', desc: 'Install from GitHub' },
      { cmd: 'recommend', desc: 'Get suggestions for your project' },
      { cmd: 'find <query>', desc: 'Search 15K+ skills' },
    ],
  },
  {
    name: 'Manage',
    commands: [
      { cmd: 'list', desc: 'View installed skills' },
      { cmd: 'sync', desc: 'Deploy to all agents' },
      { cmd: 'translate --to <agent>', desc: 'Convert formats' },
      { cmd: 'update', desc: 'Update all skills' },
    ],
  },
  {
    name: 'Team',
    commands: [
      { cmd: 'manifest init', desc: 'Create .skills file' },
      { cmd: 'team share', desc: 'Share via Git' },
      { cmd: 'publish', desc: 'Submit to marketplace' },
      { cmd: 'cicd init', desc: 'CI/CD templates' },
    ],
  },
  {
    name: 'Advanced',
    commands: [
      { cmd: 'primer', desc: 'Generate CLAUDE.md from code' },
      { cmd: 'agent translate', desc: 'Batch convert agents' },
      { cmd: 'command generate', desc: 'Create /slash commands' },
      { cmd: 'memory export', desc: 'Save session learnings' },
    ],
  },
];

export function Commands(): React.ReactElement {
  const [activeGroup, setActiveGroup] = useState(0);
  const group = COMMAND_GROUPS[activeGroup];

  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2 font-mono">40+ Commands</h2>
          <p className="text-zinc-500 font-mono text-sm">
            Everything you need from the terminal.
          </p>
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
          {COMMAND_GROUPS.map((g, i) => {
            const isActive = i === activeGroup;
            const buttonClass = isActive
              ? 'border-white text-white bg-zinc-900'
              : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300';
            return (
              <button
                key={g.name}
                onClick={() => setActiveGroup(i)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono border transition-colors ${buttonClass}`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        <div className="border border-zinc-800 bg-black/50 p-2 sm:p-4 font-mono text-[10px] sm:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
            {group.commands.map((c) => (
              <div
                key={c.cmd || 'tui'}
                className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-zinc-900/50 transition-colors rounded"
              >
                <span className="text-zinc-600">$</span>
                <span className="text-white text-[10px] sm:text-xs">
                  {c.cmd ? `skillkit ${c.cmd}` : 'npx skillkit@latest'}
                </span>
                <span className="text-zinc-600 ml-auto">→</span>
                <span className="text-zinc-500 truncate max-w-[80px] sm:max-w-none">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 text-center">
          <span className="text-zinc-600 text-[10px] sm:text-xs font-mono">
            Run <span className="text-zinc-400">skillkit --help</span> for all commands
          </span>
        </div>
      </div>
    </section>
  );
}

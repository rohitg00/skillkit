import React, { useState } from 'react';

interface CommandGroup {
  name: string;
  commands: Array<{ cmd: string; desc: string }>;
}

const COMMAND_GROUPS: CommandGroup[] = [
  {
    name: 'Core',
    commands: [
      { cmd: 'install', desc: 'Install from GitHub/GitLab/local' },
      { cmd: 'sync', desc: 'Sync skills across agents' },
      { cmd: 'translate', desc: 'Convert between agent formats' },
      { cmd: 'update', desc: 'Update installed skills' },
    ],
  },
  {
    name: 'Discovery',
    commands: [
      { cmd: 'find', desc: 'Search marketplace (15K+ skills)' },
      { cmd: 'recommend', desc: 'AI-powered suggestions' },
      { cmd: 'check', desc: 'Dry-run update check' },
      { cmd: 'list', desc: 'View installed skills' },
    ],
  },
  {
    name: 'Team',
    commands: [
      { cmd: 'manifest init', desc: 'Create .skills file' },
      { cmd: 'manifest install', desc: 'Install from manifest' },
      { cmd: 'team share', desc: 'Share skills via Git' },
      { cmd: 'publish', desc: 'Submit to marketplace' },
    ],
  },
  {
    name: 'Advanced',
    commands: [
      { cmd: 'ui', desc: 'Launch terminal UI' },
      { cmd: 'workflow run', desc: 'Execute skill pipelines' },
      { cmd: 'command generate', desc: 'Create /slash commands' },
      { cmd: 'cicd init', desc: 'Generate CI templates' },
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

        <div className="flex justify-center gap-2 mb-6">
          {COMMAND_GROUPS.map((g, i) => {
            const isActive = i === activeGroup;
            const buttonClass = isActive
              ? 'border-white text-white bg-zinc-900'
              : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300';
            return (
              <button
                key={g.name}
                onClick={() => setActiveGroup(i)}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors ${buttonClass}`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        <div className="border border-zinc-800 bg-black/50 p-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.commands.map((c) => (
              <div
                key={c.cmd}
                className="flex items-center gap-3 p-2 hover:bg-zinc-900/50 transition-colors rounded"
              >
                <span className="text-zinc-600">$</span>
                <span className="text-white">skillkit {c.cmd}</span>
                <span className="text-zinc-600 hidden sm:inline">→</span>
                <span className="text-zinc-500 hidden sm:inline truncate">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-zinc-600 text-xs font-mono">
            Run <span className="text-zinc-400">skillkit --help</span> for all commands
          </span>
        </div>
      </div>
    </section>
  );
}

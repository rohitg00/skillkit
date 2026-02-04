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
      { cmd: 'add <repo>', desc: 'Alias for install' },
      { cmd: 'recommend', desc: 'Smart suggestions' },
      { cmd: 'tree', desc: 'Browse skill taxonomy' },
      { cmd: 'marketplace', desc: 'Browse skills' },
    ],
  },
  {
    name: 'Manage',
    commands: [
      { cmd: 'list', desc: 'View installed skills' },
      { cmd: 'sync', desc: 'Deploy to all agents' },
      { cmd: 'translate --to <agent>', desc: 'Convert formats' },
      { cmd: 'update', desc: 'Update all skills' },
      { cmd: 'remove <skill>', desc: 'Remove a skill' },
      { cmd: 'status', desc: 'Show skill status' },
    ],
  },
  {
    name: 'Mesh',
    commands: [
      { cmd: 'mesh init', desc: 'Initialize network' },
      { cmd: 'mesh discover', desc: 'Find hosts on LAN' },
      { cmd: 'mesh add <host>', desc: 'Add a host' },
      { cmd: 'mesh security init', desc: 'Setup encryption' },
      { cmd: 'mesh peer trust', desc: 'Trust a peer' },
      { cmd: 'mesh health', desc: 'Check host health' },
    ],
  },
  {
    name: 'Message',
    commands: [
      { cmd: 'message send', desc: 'Send to agent' },
      { cmd: 'message inbox', desc: 'View inbox' },
      { cmd: 'message read <id>', desc: 'Read message' },
      { cmd: 'message reply <id>', desc: 'Reply to message' },
      { cmd: 'message archive', desc: 'Archive messages' },
      { cmd: 'message sent', desc: 'View sent' },
    ],
  },
  {
    name: 'Memory',
    commands: [
      { cmd: 'memory status', desc: 'View memory status' },
      { cmd: 'memory search <q>', desc: 'Search learnings' },
      { cmd: 'memory compress', desc: 'Compress observations' },
      { cmd: 'memory export', desc: 'Export as skill' },
      { cmd: 'memory reinforce', desc: 'Boost memory' },
      { cmd: 'memory --global', desc: 'Global memory' },
    ],
  },
  {
    name: 'Team',
    commands: [
      { cmd: 'manifest init', desc: 'Create .skills file' },
      { cmd: 'team init', desc: 'Initialize team' },
      { cmd: 'team share', desc: 'Share via Git' },
      { cmd: 'publish', desc: 'Submit to marketplace' },
      { cmd: 'cicd init', desc: 'CI/CD templates' },
      { cmd: 'team sync', desc: 'Sync team skills' },
    ],
  },
  {
    name: 'Server',
    commands: [
      { cmd: 'serve', desc: 'Start REST API' },
      { cmd: 'serve --port 8080', desc: 'Custom port' },
      { cmd: 'serve --host localhost', desc: 'Bind host' },
      { cmd: 'serve --cors "*"', desc: 'Set CORS origin' },
      { cmd: 'serve --cache-ttl 3600000', desc: 'Cache TTL' },
    ],
  },
  {
    name: 'Advanced',
    commands: [
      { cmd: 'primer', desc: 'Generate CLAUDE.md' },
      { cmd: 'agent translate', desc: 'Batch convert' },
      { cmd: 'command generate', desc: 'Create /commands' },
      { cmd: 'context init', desc: 'Project context' },
      { cmd: 'workflow run', desc: 'Run workflow' },
      { cmd: 'test', desc: 'Test skills' },
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
          <h2 className="text-xl font-bold text-white mb-2 font-mono">50+ Commands</h2>
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

        <div className="border border-zinc-800 bg-black/50 p-3 sm:p-4 font-mono text-[10px] sm:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
            {group.commands.map((c) => (
              <div
                key={c.cmd || 'tui'}
                className="flex items-center gap-2 p-2 hover:bg-zinc-900/50 transition-colors rounded group"
              >
                <span className="text-zinc-700 group-hover:text-zinc-500">$</span>
                <code className="text-white text-[10px] sm:text-xs whitespace-nowrap">
                  {c.cmd ? `skillkit ${c.cmd}` : 'npx skillkit@latest'}
                </code>
                <span className="text-zinc-700 ml-auto hidden sm:inline">→</span>
                <span className="text-zinc-500 text-[9px] sm:text-[11px] hidden sm:inline">{c.desc}</span>
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

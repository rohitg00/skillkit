import React, { useState, useMemo } from 'react';

type Support = 'full' | 'partial' | 'none';

interface AgentDef {
  id: string;
  name: string;
  icon: string;
  group: string;
}

interface CategoryDef {
  id: string;
  name: string;
  icon: string;
}

const AGENTS: AgentDef[] = [
  { id: 'claude-code', name: 'Claude Code', icon: '\u27C1', group: 'Tier 1' },
  { id: 'cursor', name: 'Cursor', icon: '\u25EB', group: 'Tier 1' },
  { id: 'codex', name: 'Codex', icon: '\u25CE', group: 'Tier 1' },
  { id: 'gemini-cli', name: 'Gemini CLI', icon: '\u2726', group: 'Tier 1' },
  { id: 'opencode', name: 'OpenCode', icon: '\u2B21', group: 'Tier 1' },
  { id: 'windsurf', name: 'Windsurf', icon: '\u25C7', group: 'Tier 1' },
  { id: 'github-copilot', name: 'Copilot', icon: '\u2318', group: 'Tier 1' },
  { id: 'goose', name: 'Goose', icon: '\u25CA', group: 'Tier 2' },
  { id: 'kilo', name: 'Kilo', icon: '\u25B3', group: 'Tier 2' },
  { id: 'kiro-cli', name: 'Kiro CLI', icon: '\u25BD', group: 'Tier 2' },
  { id: 'roo', name: 'Roo', icon: '\u25C6', group: 'Tier 2' },
  { id: 'trae', name: 'Trae', icon: '\u25A0', group: 'Tier 2' },
  { id: 'amp', name: 'AMP', icon: '\u26A1', group: 'Tier 2' },
  { id: 'cline', name: 'Cline', icon: '\u25CF', group: 'Tier 3' },
  { id: 'continue', name: 'Continue', icon: '\u25B6', group: 'Tier 3' },
  { id: 'antigravity', name: 'Antigravity', icon: '\u2191', group: 'Tier 3' },
];

const CATEGORIES: CategoryDef[] = [
  { id: 'security', name: 'Security', icon: '\u25D0' },
  { id: 'testing', name: 'Testing', icon: '\u25D2' },
  { id: 'react-frontend', name: 'React/Frontend', icon: '\u269B' },
  { id: 'backend', name: 'Backend', icon: '\u2393' },
  { id: 'devops', name: 'DevOps', icon: '\u25D1' },
  { id: 'python', name: 'Python', icon: '\u25C9' },
  { id: 'go', name: 'Go', icon: '\u25C8' },
  { id: 'typescript', name: 'TypeScript', icon: '\u25C8' },
  { id: 'database', name: 'Database', icon: '\u25A3' },
  { id: 'performance', name: 'Performance', icon: '\u25CE' },
  { id: 'documentation', name: 'Documentation', icon: '\u25A1' },
  { id: 'ai-ml', name: 'AI/ML', icon: '\u25CE' },
];

const MATRIX: Record<string, Record<string, Support>> = {
  'security': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'partial',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'partial',
    'amp': 'full', 'cline': 'full', 'continue': 'partial', 'antigravity': 'partial',
  },
  'testing': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'full',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'partial',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'partial',
  },
  'react-frontend': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'partial', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'partial',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'full',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'none',
  },
  'backend': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'full',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'partial',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'partial',
  },
  'devops': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'partial', 'github-copilot': 'full', 'goose': 'partial',
    'kilo': 'partial', 'kiro-cli': 'none', 'roo': 'partial', 'trae': 'partial',
    'amp': 'full', 'cline': 'partial', 'continue': 'partial', 'antigravity': 'none',
  },
  'python': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'full',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'partial',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'partial',
  },
  'go': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'partial', 'github-copilot': 'full', 'goose': 'partial',
    'kilo': 'none', 'kiro-cli': 'none', 'roo': 'partial', 'trae': 'partial',
    'amp': 'partial', 'cline': 'partial', 'continue': 'partial', 'antigravity': 'none',
  },
  'typescript': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'full',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'full',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'partial',
  },
  'database': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'partial', 'windsurf': 'partial', 'github-copilot': 'full', 'goose': 'partial',
    'kilo': 'none', 'kiro-cli': 'none', 'roo': 'partial', 'trae': 'partial',
    'amp': 'partial', 'cline': 'partial', 'continue': 'partial', 'antigravity': 'none',
  },
  'performance': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'partial', 'windsurf': 'partial', 'github-copilot': 'partial', 'goose': 'partial',
    'kilo': 'none', 'kiro-cli': 'none', 'roo': 'partial', 'trae': 'partial',
    'amp': 'partial', 'cline': 'partial', 'continue': 'partial', 'antigravity': 'none',
  },
  'documentation': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'full', 'windsurf': 'full', 'github-copilot': 'full', 'goose': 'full',
    'kilo': 'partial', 'kiro-cli': 'partial', 'roo': 'full', 'trae': 'full',
    'amp': 'full', 'cline': 'full', 'continue': 'full', 'antigravity': 'partial',
  },
  'ai-ml': {
    'claude-code': 'full', 'cursor': 'full', 'codex': 'full', 'gemini-cli': 'full',
    'opencode': 'partial', 'windsurf': 'partial', 'github-copilot': 'partial', 'goose': 'partial',
    'kilo': 'none', 'kiro-cli': 'none', 'roo': 'partial', 'trae': 'partial',
    'amp': 'partial', 'cline': 'partial', 'continue': 'partial', 'antigravity': 'none',
  },
};

const SUPPORT_CONFIG: Record<Support, { color: string; bg: string; label: string }> = {
  full: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Full' },
  partial: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Partial' },
  none: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'None' },
};

const SUPPORT_SCORE: Record<Support, number> = { full: 2, partial: 1, none: 0 };

function SupportCell({ support }: { support: Support }): React.ReactElement {
  const config = SUPPORT_CONFIG[support];
  return (
    <td className="px-1 py-2 text-center">
      <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${config.bg}`}>
        <span className={`text-[10px] font-bold ${config.color}`}>
          {support === 'full' ? '\u2713' : support === 'partial' ? '\u25CB' : '\u2715'}
        </span>
      </div>
    </td>
  );
}

function getAgentScore(agentId: string): number {
  return Object.values(MATRIX).reduce((sum, row) => sum + SUPPORT_SCORE[row[agentId] || 'none'], 0);
}

function getMaxScore(): number {
  return CATEGORIES.length * 2;
}

export function CompatibilityMatrix(): React.ReactElement {
  const [filter, setFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const groups = useMemo(() => {
    const seen = new Set<string>();
    return AGENTS.reduce<string[]>((acc, a) => {
      if (!seen.has(a.group)) {
        seen.add(a.group);
        acc.push(a.group);
      }
      return acc;
    }, []);
  }, []);

  const filteredAgents = useMemo(() => {
    let agents = AGENTS;
    if (groupFilter) {
      agents = agents.filter(a => a.group === groupFilter);
    }
    if (filter.trim()) {
      const q = filter.toLowerCase();
      agents = agents.filter(a =>
        a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
      );
    }
    return agents;
  }, [filter, groupFilter]);

  const filteredCategories = useMemo(() => {
    if (!filter.trim()) return CATEGORIES;
    const q = filter.toLowerCase();
    return CATEGORIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [filter]);

  const maxScore = getMaxScore();

  return (
    <section className="py-12 border-b border-zinc-800" style={{ backgroundColor: '#09090b' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 font-mono">Compatibility Matrix</h2>
            <p className="text-zinc-500 font-mono text-[10px] sm:text-xs">
              Skill support across 16 agents and 12 categories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500">Updated Feb 2026</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter agents or categories..."
              className="w-full bg-black border border-zinc-800 text-zinc-300 placeholder-zinc-700 font-mono text-xs px-8 py-2 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setGroupFilter(null)}
              className={`px-2.5 py-1.5 font-mono text-[10px] sm:text-xs transition-all ${
                groupFilter === null
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              All
            </button>
            {groups.map(g => (
              <button
                key={g}
                onClick={() => setGroupFilter(groupFilter === g ? null : g)}
                className={`px-2.5 py-1.5 font-mono text-[10px] sm:text-xs transition-all ${
                  groupFilter === g
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {Object.entries(SUPPORT_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${config.bg} flex items-center justify-center`}>
                <span className={`text-[8px] font-bold ${config.color}`}>
                  {key === 'full' ? '\u2713' : key === 'partial' ? '\u25CB' : '\u2715'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{config.label}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[700px]">
            <table className="w-full border-collapse font-mono text-[10px]">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 uppercase tracking-wider py-2 pr-3 sticky left-0 bg-[#09090b] z-10 min-w-[120px]">
                    Category
                  </th>
                  {filteredAgents.map(agent => (
                    <th key={agent.id} className="px-1 py-2 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">{agent.icon}</span>
                        <span className="text-zinc-400 whitespace-nowrap max-w-[50px] truncate" title={agent.name}>
                          {agent.name.length > 7 ? agent.name.slice(0, 7) : agent.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(category => (
                  <tr key={category.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2 pr-3 sticky left-0 bg-[#09090b] z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600">{category.icon}</span>
                        <span className="text-zinc-300 whitespace-nowrap">{category.name}</span>
                      </div>
                    </td>
                    {filteredAgents.map(agent => (
                      <SupportCell
                        key={agent.id}
                        support={MATRIX[category.id]?.[agent.id] || 'none'}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td className="py-3 pr-3 sticky left-0 bg-[#09090b] z-10">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Score</span>
                  </td>
                  {filteredAgents.map(agent => {
                    const score = getAgentScore(agent.id);
                    const pct = Math.round((score / maxScore) * 100);
                    const color = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <td key={agent.id} className="px-1 py-3 text-center">
                        <div className={`font-bold text-xs ${color}`}>{pct}%</div>
                        <div className="text-zinc-600 text-[9px]">{score}/{maxScore}</div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-8 text-zinc-600 font-mono text-sm">
            No agents match your filter.
          </div>
        )}

        {filteredCategories.length === 0 && filteredAgents.length > 0 && (
          <div className="text-center py-8 text-zinc-600 font-mono text-sm">
            No categories match your filter.
          </div>
        )}
      </div>
    </section>
  );
}

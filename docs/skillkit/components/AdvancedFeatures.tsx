import React, { useState } from 'react';

interface AdvancedFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  commands: Array<{ cmd: string; desc: string }>;
  highlight: string;
}

const ADVANCED_FEATURES: AdvancedFeature[] = [
  {
    id: 'generate',
    title: 'AI Generate',
    subtitle: 'Create Skills from Natural Language',
    description: 'Generate skills from plain English with multi-source context. Pulls from documentation (Context7), your codebase patterns, 15,000+ marketplace skills, and your corrections. Works with any LLM: Claude, GPT-4, Gemini, Ollama, or OpenRouter.',
    highlight: 'Multi-provider AI with 4 context sources',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    commands: [
      { cmd: 'generate', desc: 'Interactive skill wizard' },
      { cmd: 'generate --provider openai', desc: 'Use specific LLM' },
      { cmd: 'generate --compose "testing"', desc: 'Compose from skills' },
      { cmd: 'generate --agents claude,cursor', desc: 'Multi-agent output' },
    ],
  },
  {
    id: 'memory',
    title: 'Session Memory',
    subtitle: 'AI That Actually Learns',
    description: 'Your AI agents learn patterns during sessions—then forget everything. SkillKit captures these learnings and makes them permanent. Knowledge persists across sessions, projects, and even different agents.',
    highlight: 'Persistent learning across all agents',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    commands: [
      { cmd: 'memory compress', desc: 'Turn observations into learnings' },
      { cmd: 'memory search "auth"', desc: 'Find past patterns' },
      { cmd: 'memory export', desc: 'Convert to shareable skill' },
      { cmd: 'memory --global', desc: 'Share across all projects' },
    ],
  },
  {
    id: 'primer',
    title: 'Primer',
    subtitle: 'Zero-Config AI Instructions',
    description: 'Automatically generate CLAUDE.md, .cursorrules, and agent instructions by analyzing your codebase. Detects your tech stack, coding patterns, and project structure—then creates optimized instructions for all 32 agents.',
    highlight: 'Auto-generates instructions for 32 agents',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    commands: [
      { cmd: 'primer', desc: 'Analyze & generate for detected agents' },
      { cmd: 'primer --all-agents', desc: 'Generate for all 32 agents' },
      { cmd: 'primer --analyze-only', desc: 'Preview codebase analysis' },
      { cmd: 'primer --json', desc: 'Machine-readable output' },
    ],
  },
  {
    id: 'mesh',
    title: 'Mesh Network',
    subtitle: 'Multi-Machine Agent Distribution',
    description: 'Run agents across multiple machines with encrypted P2P communication. Discover peers on your LAN, establish trust with Ed25519 keys, and distribute skills across your entire infrastructure.',
    highlight: 'Encrypted P2P agent network',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    commands: [
      { cmd: 'mesh init', desc: 'Initialize your mesh node' },
      { cmd: 'mesh discover', desc: 'Find peers on LAN' },
      { cmd: 'mesh security init', desc: 'Setup Ed25519 encryption' },
      { cmd: 'mesh peer trust <id>', desc: 'Establish peer trust' },
    ],
  },
  {
    id: 'messaging',
    title: 'Inter-Agent Messaging',
    subtitle: 'Agents That Communicate',
    description: 'Send messages between AI agents across your mesh network. Coordinate complex tasks, share context, and build multi-agent workflows where agents collaborate to solve problems.',
    highlight: 'Agents collaborate across machines',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    commands: [
      { cmd: 'message send', desc: 'Send to another agent' },
      { cmd: 'message inbox', desc: 'Check your inbox' },
      { cmd: 'message reply <id>', desc: 'Reply to messages' },
      { cmd: 'message archive', desc: 'Archive old messages' },
    ],
  },
];

export function AdvancedFeatures(): React.ReactElement {
  const [activeFeature, setActiveFeature] = useState<string>('generate');
  const feature = ADVANCED_FEATURES.find(f => f.id === activeFeature) || ADVANCED_FEATURES[0];

  return (
    <section className="py-12 sm:py-16 border-b border-zinc-800 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)]"></div>
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/80 px-2 sm:px-3 py-1 mb-4 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-300 uppercase tracking-wider">Beyond Installation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-mono tracking-tight">
            Advanced Capabilities
          </h2>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto px-4">
            SkillKit isn't just a package manager. It's a complete infrastructure for 
            intelligent, distributed AI agent orchestration.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center gap-1 sm:gap-2 mb-8 flex-wrap" role="tablist" aria-label="Advanced features">
          {ADVANCED_FEATURES.map((f) => {
            const isActive = f.id === activeFeature;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={isActive}
                aria-controls="advanced-features-panel"
                id={`tab-${f.id}`}
                onClick={() => setActiveFeature(f.id)}
                className={`group relative px-2 sm:px-4 py-1.5 sm:py-2 font-mono text-xs sm:text-sm transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="relative z-10">{f.title}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700 border border-zinc-600"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feature Content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start"
          role="tabpanel"
          id="advanced-features-panel"
          aria-labelledby={`tab-${activeFeature}`}
        >
          {/* Left: Description */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-zinc-800/50 border border-zinc-700 text-white flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-mono mb-1">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 font-mono text-xs sm:text-sm">
                  {feature.subtitle}
                </p>
              </div>
            </div>
            
            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
              {feature.description}
            </p>
            
            <div className="inline-flex items-center gap-2 bg-emerald-950/30 border border-emerald-800/50 px-2 sm:px-3 py-1.5 sm:py-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-300 text-xs sm:text-sm font-mono">{feature.highlight}</span>
            </div>
          </div>

          {/* Right: Commands */}
          <div className="bg-black/60 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <span className="ml-2 text-zinc-500 text-xs font-mono">Terminal</span>
            </div>
            <div className="p-3 sm:p-4 space-y-3">
              {feature.commands.map((cmd, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-zinc-600 font-mono text-xs flex-shrink-0">$</span>
                    <code className="text-white font-mono text-xs sm:text-sm whitespace-nowrap">skillkit {cmd.cmd}</code>
                  </div>
                  <div className="pl-4 mt-1">
                    <span className="text-zinc-500 font-mono text-[10px] sm:text-xs">→ {cmd.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-sm font-mono mb-4">
            Ready to supercharge your AI agents?
          </p>
          <code className="inline-block bg-zinc-900 border border-zinc-700 px-4 py-2 text-sm font-mono text-zinc-300">
            npx skillkit@latest
          </code>
        </div>
      </div>
    </section>
  );
}

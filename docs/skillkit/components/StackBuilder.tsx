import React, { useState } from 'react';
import { searchSkills, IndexedSkill, SKILLS_INDEX } from '../data/skills-index';

interface StackItem extends IndexedSkill {
  addedAt: number;
}

const POPULAR_STACKS = [
  {
    name: 'Full Stack TypeScript',
    skills: ['react', 'nextjs', 'typescript', 'prisma', 'tailwind'],
    icon: '⚡',
  },
  {
    name: 'AI/ML Development',
    skills: ['python', 'langchain', 'openai', 'embeddings'],
    icon: '🤖',
  },
  {
    name: 'DevOps & Cloud',
    skills: ['docker', 'kubernetes', 'terraform', 'github-actions'],
    icon: '☁️',
  },
  {
    name: 'Mobile Development',
    skills: ['react-native', 'expo', 'ios', 'android'],
    icon: '📱',
  },
];

export function StackBuilder(): React.ReactElement {
  const [stack, setStack] = useState<StackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndexedSkill[]>([]);
  const [copied, setCopied] = useState(false);

  function handleSearch(query: string): void {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchSkills(query).filter(
        skill => !stack.some(s => s.id === skill.id)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }

  function addToStack(skill: IndexedSkill): void {
    if (!stack.some(s => s.id === skill.id)) {
      setStack([...stack, { ...skill, addedAt: Date.now() }]);
      setSearchQuery('');
      setSearchResults([]);
    }
  }

  function removeFromStack(skillId: string): void {
    setStack(stack.filter(s => s.id !== skillId));
  }

  function loadPresetStack(presetSkills: string[]): void {
    const newItems: StackItem[] = [];
    presetSkills.forEach(query => {
      const results = searchSkills(query);
      if (results.length > 0 && !stack.some(s => s.id === results[0].id)) {
        newItems.push({ ...results[0], addedAt: Date.now() });
      }
    });
    setStack([...stack, ...newItems]);
  }

  function generateInstallCommand(): string {
    if (stack.length === 0) return '';
    const skillIds = stack.map(s => s.id.split('/').slice(0, 2).join('/'));
    if (skillIds.length === 1) {
      return `npx skillkit@latest install ${skillIds[0]}`;
    }
    return `npx skillkit@latest install ${skillIds.join(' ')}`;
  }

  function copyCommand(): void {
    const cmd = generateInstallCommand();
    if (cmd) {
      navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function clearStack(): void {
    setStack([]);
  }

  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 font-mono">Stack Builder</h2>
            <p className="text-zinc-500 font-mono text-xs">
              Compose your perfect skill stack. Install everything with one command.
            </p>
          </div>
          {stack.length > 0 && (
            <button
              onClick={clearStack}
              className="text-zinc-500 hover:text-red-400 font-mono text-xs transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search skills to add..."
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none font-mono text-sm placeholder-zinc-600"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-700 max-h-60 overflow-y-auto">
                  {searchResults.slice(0, 8).map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => addToStack(skill)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                    >
                      <div className="font-mono text-sm text-white">{skill.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{skill.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-zinc-500 text-xs font-mono block">Quick add:</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_STACKS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => loadPresetStack(preset.skills)}
                    className="text-[10px] sm:text-xs bg-zinc-900 text-zinc-400 px-2 sm:px-3 py-1 sm:py-1.5 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors font-mono"
                  >
                    {preset.icon} <span className="hidden sm:inline">{preset.name}</span><span className="sm:hidden">{preset.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {stack.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Your Stack ({stack.length} skills)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stack.map(skill => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-white truncate">{skill.name}</div>
                        <div className="text-xs text-zinc-600 truncate">{skill.source}</div>
                      </div>
                      <button
                        onClick={() => removeFromStack(skill.id)}
                        className="ml-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-20 bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                Install Command
              </div>
              {stack.length > 0 ? (
                <>
                  <pre className="bg-black border border-zinc-800 p-3 overflow-x-auto text-xs mb-3">
                    <code className="font-mono text-green-400 whitespace-pre-wrap break-all">
                      {generateInstallCommand()}
                    </code>
                  </pre>
                  <button
                    onClick={copyCommand}
                    className="w-full bg-white text-black py-2 font-mono text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        COPIED!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        COPY COMMAND
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-zinc-600 text-xs font-mono text-center py-6">
                  Add skills to generate install command
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

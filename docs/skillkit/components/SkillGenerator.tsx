import React, { useState } from 'react';
import { searchSkills, IndexedSkill } from '../data/skills-index';

export function SkillGenerator(): React.ReactElement {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndexedSkill[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent): void {
    e.preventDefault();
    if (!query.trim()) return;
    const found = searchSkills(query);
    setResults(found);
    setHasSearched(true);
  }

  async function copyInstall(skill: IndexedSkill): Promise<void> {
    const cmd = `npx skillkit@latest install ${skill.id.split('/').slice(0, 2).join('/')}`;
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(skill.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-white mb-2 font-mono">Find Skills</h2>
        <p className="text-zinc-500 font-mono text-xs">
          Search 400K+ skills across registries
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="react, typescript, testing, kubernetes..."
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 font-mono text-sm focus:border-zinc-600 outline-none placeholder-zinc-600"
          />
          <button
            type="submit"
            className="bg-zinc-800 text-white px-6 py-3 font-mono text-sm hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Search
          </button>
        </div>
      </form>

      {hasSearched && (
        <div className="max-w-2xl mx-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-500 mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              {results.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-white mb-1">{skill.name}</div>
                      <div className="text-xs text-zinc-500 mb-2 truncate">{skill.description || 'No description'}</div>
                      <div className="text-[11px] text-zinc-600 font-mono">{skill.source}</div>
                    </div>
                    <button
                      onClick={() => copyInstall(skill)}
                      className="text-xs font-mono text-zinc-500 hover:text-white transition-colors shrink-0"
                    >
                      {copied === skill.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  {skill.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {skill.tags.slice(0, 4).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-zinc-800/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 font-mono text-sm py-8">
              No skills found for "{query}"
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
            {['react', 'typescript', 'nextjs', 'testing', 'docker', 'kubernetes', 'python', 'security'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  const found = searchSkills(tag);
                  setResults(found);
                  setHasSearched(true);
                }}
                className="text-zinc-600 hover:text-white px-2 py-1 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { generateAgentSkill } from '../services/geminiService';
import { searchSkills, IndexedSkill } from '../data/skills-index';
import { AgentSkill, LoadingState } from '../types';

interface PriorityBadgeProps {
  priority: string;
}

type ViewMode = 'search' | 'marketplace' | 'generated' | 'content';

const PRIORITY_COLORS = {
  must: 'bg-red-900/50 text-red-300 border-red-800',
  should: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  may: 'bg-blue-900/50 text-blue-300 border-blue-800',
} as const;

function PriorityBadge({ priority }: PriorityBadgeProps): React.ReactElement {
  const colorClass = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.may;
  return (
    <span className={`text-xs px-2 py-0.5 border font-mono uppercase ${colorClass}`}>
      {priority}
    </span>
  );
}

function generateSkillMd(skill: AgentSkill): string {
  const frontmatter = `---
name: "${skill.name}"
description: "${skill.description}"
version: "${skill.version}"
tags: [${skill.tags.map(t => `"${t}"`).join(', ')}]
${skill.filePatterns?.length ? `globs: [${skill.filePatterns.map(p => `"${p}"`).join(', ')}]` : ''}
---`;

  const principlesSection = skill.principles.map(p =>
    `### ${p.priority.toUpperCase()}: ${p.title}\n\n${p.description}`
  ).join('\n\n');

  const patternsSection = skill.patterns.map(p =>
    `### ${p.name}\n\n${p.description}\n\n\`\`\`${p.language || 'typescript'}\n${p.example}\n\`\`\``
  ).join('\n\n');

  const antiPatternsSection = skill.antiPatterns.map(ap => {
    let content = `### ${ap.name}\n\n${ap.description}`;
    if (ap.badExample) {
      content += `\n\n**Bad:**\n\`\`\`typescript\n${ap.badExample}\n\`\`\``;
    }
    if (ap.goodExample) {
      content += `\n\n**Good:**\n\`\`\`typescript\n${ap.goodExample}\n\`\`\``;
    }
    return content;
  }).join('\n\n');

  const content = `# ${skill.title}

${skill.description}

## When to Apply

${skill.applicability}

${skill.filePatterns?.length ? `**File patterns:** ${skill.filePatterns.map(p => `\`${p}\``).join(', ')}` : ''}

## Principles

${principlesSection}

## Patterns

${patternsSection}

## Anti-Patterns

${antiPatternsSection}

${skill.references?.length ? `## References\n\n${skill.references.map(r => `- ${r}`).join('\n')}` : ''}
`;

  return `${frontmatter}\n\n${content}`;
}

function downloadContent(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// localStorage cache for AI-generated skills
const CACHE_KEY = 'skillkit_ai_cache';
const CACHE_VERSION = 1;
const MAX_CACHE_ENTRIES = 50;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedSkill {
  skill: AgentSkill;
  query: string;
  timestamp: number;
}

interface SkillCache {
  version: number;
  skills: Record<string, CachedSkill>;
}

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getSkillCache(): SkillCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as SkillCache;
      if (parsed.version === CACHE_VERSION) {
        // Prune expired entries
        const now = Date.now();
        let mutated = false;
        for (const [key, value] of Object.entries(parsed.skills)) {
          if (!value?.timestamp || now - value.timestamp >= CACHE_TTL_MS) {
            delete parsed.skills[key];
            mutated = true;
          }
        }
        if (mutated) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { version: CACHE_VERSION, skills: {} };
}

function getCachedSkill(query: string): AgentSkill | null {
  const cache = getSkillCache();
  const key = normalizeQuery(query);
  const cached = cache.skills[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.skill;
  }
  return null;
}

function setCachedSkill(query: string, skill: AgentSkill): void {
  try {
    const cache = getSkillCache();
    const key = normalizeQuery(query);
    cache.skills[key] = {
      skill,
      query: key,
      timestamp: Date.now(),
    };
    // Enforce max entries limit
    const entries = Object.entries(cache.skills);
    if (entries.length > MAX_CACHE_ENTRIES) {
      entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entries.length - MAX_CACHE_ENTRIES)
        .forEach(([k]) => delete cache.skills[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

export function SkillGenerator(): React.ReactElement {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>('search');

  const [marketplaceResults, setMarketplaceResults] = useState<IndexedSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<IndexedSkill | null>(null);
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const [generatedSkill, setGeneratedSkill] = useState<AgentSkill | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [activeTab, setActiveTab] = useState<'principles' | 'patterns' | 'antipatterns'>('principles');

  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent): void {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    setSelectedSkill(null);
    setSkillContent(null);
    setGeneratedSkill(null);

    const results = searchSkills(input);
    setMarketplaceResults(results);
    setViewMode(results.length > 0 ? 'marketplace' : 'search');
    setStatus(LoadingState.SUCCESS);
  }

  async function handleViewSkill(skill: IndexedSkill): Promise<void> {
    setSelectedSkill(skill);
    setSkillContent(null);
    setViewMode('content');

    if (skill.rawUrl) {
      setStatus(LoadingState.LOADING);
      try {
        const response = await fetch(skill.rawUrl);
        if (response.ok) {
          const content = await response.text();
          setSkillContent(content);
        }
      } catch {
        // Silently handle fetch errors
      }
      setStatus(LoadingState.SUCCESS);
    }
  }

  async function handleGenerateWithAI(): Promise<void> {
    setError(null);

    // Check cache first
    const cached = getCachedSkill(input);
    if (cached) {
      setGeneratedSkill(cached);
      setIsFromCache(true);
      setViewMode('generated');
      setStatus(LoadingState.SUCCESS);
      return;
    }

    setStatus(LoadingState.LOADING);
    setIsFromCache(false);

    try {
      const result = await generateAgentSkill(input);
      setGeneratedSkill(result);
      setCachedSkill(input, result); // Cache the result
      setViewMode('generated');
      setStatus(LoadingState.SUCCESS);
    } catch {
      setError("Failed to generate skill. Please try again.");
      setStatus(LoadingState.ERROR);
    }
  }

  function submitToMarketplace(): void {
    if (!generatedSkill) return;

    const slug = generatedSkill.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const skillContent = generateSkillMd(generatedSkill);

    const body = `## 📤 AI-Generated Skill: ${generatedSkill.title}

### Skill Details
- **Name:** ${generatedSkill.name}
- **Description:** ${generatedSkill.description}
- **Tags:** ${generatedSkill.tags.join(', ')}
- **Version:** ${generatedSkill.version}

### SKILL.md Content

<details>
<summary>Click to expand</summary>

\`\`\`markdown
${skillContent.slice(0, 4000)}${skillContent.length > 4000 ? '\n...(truncated)' : ''}
\`\`\`

</details>

### Checklist for Maintainer
- [ ] Review skill content for quality
- [ ] Add to \`marketplace/skills.json\`

---
**Generated via:** AI Skill Generator
**Search query:** "${input}"`;

    const title = encodeURIComponent(`[AI Skill] ${generatedSkill.title}`);
    const encodedBody = encodeURIComponent(body);
    const url = `https://github.com/rohitg00/skillkit/issues/new?title=${title}&body=${encodedBody}&labels=ai-generated,skill-submission`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleBack(): void {
    switch (viewMode) {
      case 'content':
        setViewMode('marketplace');
        setSelectedSkill(null);
        setSkillContent(null);
        break;
      case 'generated':
        setViewMode(marketplaceResults.length > 0 ? 'marketplace' : 'search');
        setGeneratedSkill(null);
        break;
      default:
        setViewMode('search');
        setMarketplaceResults([]);
    }
  }

  function downloadSkillMd(): void {
    if (skillContent) {
      downloadContent(skillContent, 'SKILL.md');
    }
  }

  function downloadGeneratedSkillMd(): void {
    if (generatedSkill) {
      downloadContent(generateSkillMd(generatedSkill), 'SKILL.md');
    }
  }

  // Focus input only after user interaction, not on initial page load
  useEffect(() => {
    if (status === LoadingState.SUCCESS && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [status]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1 font-sans">Skill Finder</h2>
        <p className="text-zinc-400 font-mono text-xs">
          Search the marketplace or generate new skills with AI.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., React hooks, TypeScript, Next.js..."
            className="flex-1 bg-surface border border-zinc-700 text-white px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none font-mono text-sm placeholder-zinc-600"
            disabled={status === LoadingState.LOADING}
          />
          <Button type="submit" isLoading={status === LoadingState.LOADING} className="sm:w-auto w-full">
            SEARCH
          </Button>
        </div>
        {error && <p className="mt-2 text-red-400 font-mono text-xs">{error}</p>}
      </form>

      {viewMode !== 'search' && status !== LoadingState.LOADING && (
        <button
          onClick={handleBack}
          className="mb-6 text-zinc-400 hover:text-white font-mono text-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {viewMode === 'marketplace' && status === LoadingState.SUCCESS && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-mono text-zinc-300">
              Found {marketplaceResults.length} skill{marketplaceResults.length !== 1 ? 's' : ''} in marketplace
            </h3>
          </div>

          <div className="space-y-3 mb-8">
            {marketplaceResults.map((skill) => (
              <Card
                key={skill.id}
                className="hover:border-zinc-500 cursor-pointer transition-all"
                onClick={() => handleViewSkill(skill)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">{skill.name}</h4>
                    <p className="text-zinc-400 text-sm mb-2">{skill.description || 'No description'}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      <span>{skill.source}</span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {skill.tags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 border border-zinc-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <p className="text-zinc-500 font-mono text-sm mb-4">
              Don't see what you need? Generate a custom skill with AI.
            </p>
            <Button onClick={handleGenerateWithAI}>
              GENERATE WITH AI
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'search' && status === LoadingState.SUCCESS && marketplaceResults.length === 0 && input && (
        <div className="animate-fade-in-up text-center py-4">
          <div className="text-zinc-500 font-mono text-sm mb-4">
            No skills found for "{input}" in the marketplace.
          </div>
          <Button onClick={handleGenerateWithAI}>
            GENERATE WITH AI
          </Button>
        </div>
      )}

      {viewMode === 'content' && selectedSkill && (
        <div className="animate-fade-in-up">
          <div className="flex items-start justify-between mb-6 border-b border-zinc-800 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedSkill.name}</h3>
              <p className="text-zinc-400 font-mono text-sm mb-2">{selectedSkill.description}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span>{selectedSkill.source}</span>
                {selectedSkill.sourceUrl && (
                  <>
                    <span>•</span>
                    <a href={selectedSkill.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                      View on GitHub
                    </a>
                  </>
                )}
              </div>
            </div>
            {skillContent && (
              <button
                onClick={downloadSkillMd}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 font-mono text-sm hover:bg-zinc-200 transition-colors shrink-0 ml-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                DOWNLOAD
              </button>
            )}
          </div>

          {status === LoadingState.LOADING ? (
            <div className="text-zinc-500 font-mono text-sm">Loading content...</div>
          ) : skillContent ? (
            <pre className="bg-zinc-900 border border-zinc-700 p-6 overflow-x-auto text-sm max-h-[600px] overflow-y-auto">
              <code className="text-zinc-100 font-mono whitespace-pre-wrap">{skillContent}</code>
            </pre>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <p className="text-zinc-400 font-mono text-sm mb-4">
                Skill content not available for direct preview.
              </p>
              <a
                href={selectedSkill.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 font-mono text-sm hover:bg-zinc-700 transition-colors"
              >
                View on GitHub
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-zinc-500 font-mono text-sm mb-3">Install with SkillKit:</p>
            <pre className="bg-zinc-950 border border-zinc-800 p-4 text-sm overflow-x-auto">
              <code className="text-zinc-300 font-mono text-xs sm:text-sm whitespace-nowrap">
                npx skillkit install {selectedSkill.id.split('/').slice(0, 2).join('/')}
              </code>
            </pre>
          </div>
        </div>
      )}

      {viewMode === 'generated' && generatedSkill && (
        <div className="animate-fade-in-up">
          <div className="mb-8 border-b border-zinc-800 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{generatedSkill.title}</h3>
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 border border-zinc-800">
                    v{generatedSkill.version}
                  </span>
                  <span className="text-xs font-mono text-purple-400 bg-purple-900/30 px-2 py-1 border border-purple-800/50">
                    AI Generated
                  </span>
                  {isFromCache && (
                    <span className="text-xs font-mono text-green-400 bg-green-900/30 px-2 py-1 border border-green-800/50">
                      Cached
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 font-mono text-xs sm:text-sm mb-4">{generatedSkill.description}</p>
                <div className="flex flex-wrap gap-2">
                  {generatedSkill.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-zinc-900 text-zinc-400 px-2 py-1 border border-zinc-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={downloadGeneratedSkillMd}
                  className="flex items-center justify-center gap-2 bg-white text-black px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm hover:bg-zinc-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">DOWNLOAD</span>
                </button>
                <button
                  type="button"
                  onClick={submitToMarketplace}
                  className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm hover:bg-purple-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="hidden sm:inline">SUBMIT</span>
                </button>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-2">When to Apply</h4>
            <p className="text-zinc-300">{generatedSkill.applicability}</p>
            {generatedSkill.filePatterns && generatedSkill.filePatterns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {generatedSkill.filePatterns.map((pattern, idx) => (
                  <code key={idx} className="text-xs bg-zinc-900 text-zinc-300 px-2 py-1 border border-zinc-800">
                    {pattern}
                  </code>
                ))}
              </div>
            )}
          </Card>

          <div className="flex overflow-x-auto border-b border-zinc-800 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(['principles', 'patterns', 'antipatterns'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-6 py-3 font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-white -mb-px'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'antipatterns' ? 'Anti-Patterns' : tab}
                <span className="ml-1 sm:ml-2 text-xs text-zinc-600">
                  ({tab === 'principles' ? generatedSkill.principles.length : tab === 'patterns' ? generatedSkill.patterns.length : generatedSkill.antiPatterns.length})
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab === 'principles' && generatedSkill.principles.map((principle, idx) => (
              <Card key={idx} className="hover:border-zinc-600 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-lg font-semibold text-white">{principle.title}</h4>
                  <PriorityBadge priority={principle.priority} />
                </div>
                <p className="text-zinc-400 leading-relaxed">{principle.description}</p>
              </Card>
            ))}

            {activeTab === 'patterns' && generatedSkill.patterns.map((pattern, idx) => (
              <Card key={idx} className="hover:border-zinc-600 transition-colors">
                <h4 className="text-lg font-semibold text-white mb-2">{pattern.name}</h4>
                <p className="text-zinc-400 mb-4">{pattern.description}</p>
                <pre className="bg-zinc-900 border border-zinc-700 p-4 overflow-x-auto text-sm">
                  <code className="text-zinc-100 font-mono">{pattern.example}</code>
                </pre>
              </Card>
            ))}

            {activeTab === 'antipatterns' && generatedSkill.antiPatterns.map((ap, idx) => (
              <Card key={idx} className="hover:border-zinc-600 transition-colors border-red-900/30">
                <h4 className="text-lg font-semibold text-white mb-2">{ap.name}</h4>
                <p className="text-zinc-400 mb-4">{ap.description}</p>
                {ap.badExample && (
                  <div className="mb-4">
                    <div className="text-xs font-mono text-red-400 mb-1 uppercase">Bad</div>
                    <pre className="bg-red-950/50 border border-red-800/50 p-4 overflow-x-auto text-sm">
                      <code className="text-red-100 font-mono">{ap.badExample}</code>
                    </pre>
                  </div>
                )}
                {ap.goodExample && (
                  <div>
                    <div className="text-xs font-mono text-green-400 mb-1 uppercase">Good</div>
                    <pre className="bg-green-950/30 border border-green-800/50 p-4 overflow-x-auto text-sm">
                      <code className="text-green-100 font-mono">{ap.goodExample}</code>
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {generatedSkill.references && generatedSkill.references.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-3">References</h4>
              <ul className="space-y-1">
                {generatedSkill.references.map((ref, idx) => (
                  <li key={idx}>
                    {isValidUrl(ref) ? (
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white font-mono text-sm transition-colors"
                      >
                        {ref}
                      </a>
                    ) : (
                      <span className="text-zinc-400 font-mono text-sm">{ref}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

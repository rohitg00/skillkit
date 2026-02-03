import React, { useState, useMemo } from 'react';

const SKILLKIT_LOGO_SVG_BASE64 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0id2hpdGUiPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjEiIHk9IjEiLz48cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB4PSI5IiB5PSIxIi8+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iNiIgeD0iMSIgeT0iOSIvPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjkiIHk9IjkiLz48L3N2Zz4=';

const SUGGESTED_SKILLS = [
  'react', 'typescript', 'nextjs', 'python', 'docker',
  'kubernetes', 'tailwind', 'graphql', 'prisma', 'langchain',
  'openai', 'rust', 'go', 'vue', 'svelte',
  'security', 'testing', 'cicd', 'aws', 'terraform',
];

function encodeBadgeSegment(text: string): string {
  return encodeURIComponent(text).replace(/-/g, '--');
}

function buildBadgeUrl(skills: string[]): string {
  if (skills.length === 0) {
    return `https://img.shields.io/badge/SkillKit-No%20Skills-555555?style=flat-square&logo=data:image/svg+xml;base64,${SKILLKIT_LOGO_SVG_BASE64}`;
  }

  const maxDisplay = 5;
  const displayNames = skills.slice(0, maxDisplay);
  const suffix = skills.length > maxDisplay ? ` +${skills.length - maxDisplay} more` : '';
  const label = `SkillKit ${skills.length} skills`;
  const message = displayNames.join(' | ') + suffix;

  return `https://img.shields.io/badge/${encodeBadgeSegment(label)}-${encodeBadgeSegment(message)}-black?style=flat-square&logo=data:image/svg+xml;base64,${SKILLKIT_LOGO_SVG_BASE64}`;
}

export function BadgeGenerator(): React.ReactElement {
  const [skills, setSkills] = useState<string[]>(['react', 'typescript', 'nextjs']);
  const [inputValue, setInputValue] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const badgeUrl = useMemo(() => buildBadgeUrl(skills), [skills]);

  const markdown = `[![SkillKit Stack](${badgeUrl})](https://agenstskills.com)`;
  const html = `<a href="https://agenstskills.com"><img src="${badgeUrl}" alt="SkillKit Stack" /></a>`;

  function addSkill(skill: string): void {
    const trimmed = skill.trim().toLowerCase();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setInputValue('');
  }

  function removeSkill(skill: string): void {
    setSkills(skills.filter(s => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  }

  async function copyToClipboard(text: string, type: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // silently ignore
    }
  }

  const availableSuggestions = SUGGESTED_SKILLS.filter(s => !skills.includes(s));

  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1 font-mono">Badge Generator</h2>
          <p className="text-zinc-500 font-mono text-xs">
            Create a shareable badge for your skill stack. Add it to your README.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill name and press Enter..."
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none font-mono text-sm placeholder-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <span className="text-zinc-500 text-xs font-mono block">Quick add:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.slice(0, 12).map(skill => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="text-[10px] sm:text-xs bg-zinc-900 text-zinc-400 px-2 sm:px-3 py-1 sm:py-1.5 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors font-mono"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    Skills in Badge ({skills.length})
                  </div>
                  <button
                    onClick={() => setSkills([])}
                    className="text-zinc-500 hover:text-red-400 font-mono text-xs transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div
                      key={skill}
                      className="flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 group"
                    >
                      <span className="font-mono text-sm text-white">{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="lg:sticky lg:top-20 bg-zinc-900/30 border border-zinc-800 p-4 space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Preview</div>

              <div className="flex justify-center py-3 bg-black/50 border border-zinc-800">
                {skills.length > 0 ? (
                  <img
                    src={badgeUrl}
                    alt="SkillKit Stack Badge"
                    className="h-5"
                  />
                ) : (
                  <span className="text-zinc-600 text-xs font-mono">Add skills to preview</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-zinc-500">Markdown</div>
                <pre className="bg-black/50 p-2 overflow-x-auto text-[10px] border border-zinc-800">
                  <code className="font-mono text-zinc-300 whitespace-pre-wrap break-all">
                    {markdown}
                  </code>
                </pre>
                <button
                  onClick={() => copyToClipboard(markdown, 'markdown')}
                  className="w-full bg-zinc-800 text-zinc-300 py-1.5 font-mono text-xs hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
                >
                  {copiedType === 'markdown' ? 'Copied!' : 'Copy Markdown'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-zinc-500">HTML</div>
                <pre className="bg-black/50 p-2 overflow-x-auto text-[10px] border border-zinc-800">
                  <code className="font-mono text-zinc-300 whitespace-pre-wrap break-all">
                    {html}
                  </code>
                </pre>
                <button
                  onClick={() => copyToClipboard(html, 'html')}
                  className="w-full bg-zinc-800 text-zinc-300 py-1.5 font-mono text-xs hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
                >
                  {copiedType === 'html' ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>

              <div className="text-[10px] font-mono text-zinc-600 text-center pt-2 border-t border-zinc-800">
                Powered by shields.io
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

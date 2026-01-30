import React, { useState } from 'react';
import { SKILLS_INDEX, IndexedSkill, getSkillsByTag } from '../data/skills-index';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '◆' },
  { id: 'react', name: 'React', icon: '⚛' },
  { id: 'typescript', name: 'TypeScript', icon: '◈' },
  { id: 'python', name: 'Python', icon: '◉' },
  { id: 'ai', name: 'AI/ML', icon: '◎' },
  { id: 'security', name: 'Security', icon: '◐' },
  { id: 'devops', name: 'DevOps', icon: '◑' },
  { id: 'testing', name: 'Testing', icon: '◒' },
] as const;

const TRENDING_SKILLS = [
  'anthropics/skills/claude-code-guide',
  'anthropics/skills/claude-code-setup',
  'obra/superpowers/tdd',
  'vercel-labs/agent-skills/nextjs',
  'trailofbits/skills/security-review',
  'expo/skills/react-native',
  'remotion-dev/skills/video',
  'supabase/agent-skills/database',
];

function getTrendingSkills(): IndexedSkill[] {
  return TRENDING_SKILLS
    .map(id => SKILLS_INDEX.find(s => s.id === id))
    .filter((s): s is IndexedSkill => s !== undefined)
    .slice(0, 8);
}

function getPopularByCategory(category: string): IndexedSkill[] {
  if (category === 'all') {
    return SKILLS_INDEX.slice(0, 12);
  }
  return getSkillsByTag(category).slice(0, 12);
}

export function TrendingSkills(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const trendingSkills = getTrendingSkills();
  const categorySkills = getPopularByCategory(activeCategory);

  return (
    <section className="py-12 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 font-mono">Trending Skills</h2>
            <p className="text-zinc-500 font-mono text-[10px] sm:text-xs">
              Popular skills used by the community.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500">Updated weekly</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
          {trendingSkills.map((skill, index) => (
            <div
              key={skill.id}
              className="relative group bg-zinc-900/50 border border-zinc-800 p-2 sm:p-4 hover:border-zinc-600 transition-all cursor-pointer"
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 text-[10px] sm:text-xs font-mono text-zinc-600">
                #{index + 1}
              </div>
              <div className="font-mono text-[11px] sm:text-sm text-white mb-1 truncate pr-4 sm:pr-6">{skill.name}</div>
              <div className="text-[10px] sm:text-xs text-zinc-600 truncate">{skill.source}</div>
              {skill.tags.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                  {skill.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {hoveredSkill === skill.id && (
                <div className="absolute inset-0 bg-white/5 pointer-events-none transition-opacity"></div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-6 sm:pt-8">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-wider">Browse by Category</h3>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs transition-all whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                <span className="mr-1 sm:mr-1.5">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {categorySkills.map(skill => (
              <div
                key={skill.id}
                className="bg-zinc-900/30 border border-zinc-800 p-4 hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-white mb-1 truncate">{skill.name}</div>
                    <div className="text-xs text-zinc-600 line-clamp-2">{skill.description || 'No description'}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                  <div className="text-[10px] text-zinc-600 font-mono truncate">{skill.source}</div>
                  {skill.tags.length > 0 && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 flex-shrink-0 ml-2">
                      {skill.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {categorySkills.length === 0 && (
            <div className="text-center py-8 text-zinc-600 font-mono text-sm">
              No skills found in this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

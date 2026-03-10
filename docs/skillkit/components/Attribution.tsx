import React from 'react';
import sourcesData from '../../../marketplace/sources.json';

interface Source {
  source: string;
  name: string;
  official?: boolean;
  registry?: string;
}

const OFFICIAL_SOURCES = (sourcesData.sources as Source[]).filter(s => s.official);
const COMMUNITY_SOURCES = (sourcesData.sources as Source[]).filter(s => !s.official && s.source !== 'skills.sh');

export function Attribution(): React.ReactElement {
  return (
    <section className="py-12 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2 font-mono">Skill Sources</h2>
          <p className="text-zinc-500 font-mono text-xs">
            {sourcesData.sources.length} sources aggregated from open source repositories and registries
          </p>
        </div>

        <div className="mb-8">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
            Official ({OFFICIAL_SOURCES.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_SOURCES.map(source => (
              <a
                key={source.source}
                href={source.registry ? `https://${source.source}` : `https://github.com/${source.source}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 hover:border-zinc-600 hover:text-white transition-colors text-zinc-400 font-mono text-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {source.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
            Community ({COMMUNITY_SOURCES.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMUNITY_SOURCES.map(source => (
              <a
                key={source.source}
                href={`https://github.com/${source.source}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors font-mono text-[11px] px-2 py-1 bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700"
              >
                {source.source}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 text-center">
          <a
            href="https://github.com/rohitg00/skillkit/issues/new?template=add-source.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add your repository
          </a>
        </div>
      </div>
    </section>
  );
}

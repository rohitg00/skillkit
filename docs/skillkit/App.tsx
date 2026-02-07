import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Agents } from './components/Agents';
import { Footer } from './components/Footer';
import { SkillGenerator } from './components/SkillGenerator';
import { SkillSubmitForm } from './components/SkillSubmitForm';
import { Commands } from './components/Commands';
import { StackBuilder } from './components/StackBuilder';
import { TrendingSkills } from './components/TrendingSkills';
import { Attribution } from './components/Attribution';
import { AdvancedFeatures } from './components/AdvancedFeatures';
import { UseCases } from './components/UseCases';
import { TeamEnterprise } from './components/TeamEnterprise';
import { BadgeGenerator } from './components/BadgeGenerator';
import { CompatibilityMatrix } from './components/CompatibilityMatrix';
import { useStats } from './hooks/useStats';

const GITHUB_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

function scrollToTop(e: React.MouseEvent): void {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(e: React.MouseEvent, sectionId: string): void {
  e.preventDefault();
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `#${sectionId}`);
  }
}

export default function App(): React.ReactElement {
  const stats = useStats();

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-white selection:text-black" style={{ backgroundColor: '#000000' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 backdrop-blur-md" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2">
            <a href="#" onClick={scrollToTop} className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 bg-white"></div>
              <span className="text-base font-bold tracking-tight text-white font-mono">SKILLKIT</span>
            </a>
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
              <a
                href="#trending"
                onClick={(e) => scrollToSection(e, 'trending')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Trending
              </a>
              <a
                href="#stack"
                onClick={(e) => scrollToSection(e, 'stack')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Stack
              </a>
              <a
                href="#matrix"
                onClick={(e) => scrollToSection(e, 'matrix')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Matrix
              </a>
              <a
                href="#badge"
                onClick={(e) => scrollToSection(e, 'badge')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Badge
              </a>
              <a
                href="#advanced"
                onClick={(e) => scrollToSection(e, 'advanced')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#use-cases"
                onClick={(e) => scrollToSection(e, 'use-cases')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Use Cases
              </a>
              <a
                href="#skills"
                onClick={(e) => scrollToSection(e, 'skills')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Generator
              </a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="/api"
                className="text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-mono"
              >
                API
              </a>
              <a
                href="https://agenstskills.com/docs"
                className="text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-mono"
              >
                Docs
              </a>
              <a
                href="https://github.com/rohitg00/skillkit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500 px-2 py-1 transition-colors group"
                aria-label="GitHub Stars"
              >
                {GITHUB_ICON}
                <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-yellow-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">{stats.stars}</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <Hero version={stats.version} stars={stats.stars} />

        <div className="border-b border-zinc-800/50 py-2.5" style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.95), rgba(0,0,0,1))' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs font-mono">
              <a
                href="https://www.npmjs.com/package/skillkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors group"
              >
                <span className="text-zinc-600 group-hover:text-zinc-400">v</span>
                <span className="text-white font-medium">{stats.version}</span>
              </a>
              <span className="text-zinc-800">·</span>
              <a
                href="https://www.npmjs.com/package/skillkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors group"
              >
                <svg className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-white font-medium">{stats.downloads}</span>
              </a>
              <span className="text-zinc-800">·</span>
              <a
                href="https://github.com/rohitg00/skillkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors group"
              >
                <svg className="w-3 h-3 text-zinc-600 group-hover:text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-white font-medium">{stats.stars}</span>
              </a>
              <span className="text-zinc-800 hidden sm:inline">·</span>
              <a
                href="https://www.producthunt.com/products/skillkit-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-skillkit-2"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1071813&theme=dark"
                  alt="SkillKit on Product Hunt"
                  height="28"
                  style={{ height: '28px', width: 'auto' }}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Agent Support - Quick visual proof */}
        <Agents />
        
        {/* Core Features & Comparison - Value prop at a glance */}
        <Features />

        {/* Trending Skills - Social proof, what's popular */}
        <section id="trending" style={{ scrollMarginTop: '4rem' }}>
          <TrendingSkills />
        </section>

        {/* Stack Builder - Interactive, engaging */}
        <section id="stack" style={{ scrollMarginTop: '4rem' }}>
          <StackBuilder />
        </section>
        
        {/* Compatibility Matrix */}
        <section id="matrix" style={{ scrollMarginTop: '4rem' }}>
          <CompatibilityMatrix />
        </section>

        {/* Badge Generator */}
        <section id="badge" style={{ scrollMarginTop: '4rem' }}>
          <BadgeGenerator />
        </section>

        {/* Advanced Capabilities: Memory, Primer, Mesh, Messaging */}
        <section id="advanced" style={{ scrollMarginTop: '4rem' }}>
          <AdvancedFeatures />
        </section>
        
        {/* Commands Reference */}
        <Commands />
        
        {/* Real-World Use Cases */}
        <section id="use-cases" style={{ scrollMarginTop: '4rem' }}>
          <UseCases />
        </section>
        
        {/* Team & Enterprise */}
        <section id="team" style={{ scrollMarginTop: '4rem' }}>
          <TeamEnterprise />
        </section>

        {/* Skill Generator */}
        <section id="skills" className="py-12 border-b border-zinc-800" style={{ scrollMarginTop: '4rem' }}>
          <SkillGenerator />
        </section>

        {/* Submit Skill */}
        <section id="submit" className="py-12 border-b border-zinc-800" style={{ backgroundColor: '#09090b', scrollMarginTop: '4rem' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 font-mono">Submit Your Skill</h2>
              <p className="text-zinc-400 font-mono text-sm">
                Share your AI agent skills with the community.
              </p>
            </div>
            <SkillSubmitForm />
          </div>
        </section>

        {/* Attribution & Sources */}
        <section id="sources" style={{ scrollMarginTop: '4rem' }}>
          <Attribution />
        </section>
      </main>

      <Footer />
    </div>
  );
}

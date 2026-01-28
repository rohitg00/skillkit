import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Agents } from './components/Agents';
import { Footer } from './components/Footer';
import { SkillGenerator } from './components/SkillGenerator';
import { SkillSubmitForm } from './components/SkillSubmitForm';
import { Commands } from './components/Commands';
import { Documentation } from './components/Documentation';

const GITHUB_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const NPM_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
  </svg>
);

function scrollToTop(e: React.MouseEvent): void {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-white selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <a href="#" onClick={scrollToTop} className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 bg-white"></div>
              <span className="text-base font-bold tracking-tight text-white font-mono">SKILLKIT</span>
            </a>
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="#docs"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-mono hidden sm:block"
              >
                Docs
              </a>
              <a
                href="https://www.npmjs.com/package/skillkit"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                aria-label="npm"
              >
                {NPM_ICON}
              </a>
              <a
                href="https://github.com/rohitg00/skillkit"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-white transition-colors p-2"
                aria-label="GitHub"
              >
                {GITHUB_ICON}
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <Hero />
        <Agents />
        <Features />
        <Commands />

        <section id="docs" className="py-12 border-b border-zinc-800 bg-surface">
          <Documentation />
        </section>

        <section id="skills" className="py-12 border-b border-zinc-800">
          <SkillGenerator />
        </section>

        <section id="submit" className="py-12 border-b border-zinc-800 bg-surface">
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
      </main>

      <Footer />
    </div>
  );
}

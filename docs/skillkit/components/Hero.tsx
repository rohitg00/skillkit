import React, { useState, useEffect } from 'react';
import { Button } from './Button';

const ASCII_LOGO = `
 ███████ ██   ██ ██ ██      ██      ██   ██ ██ ████████
 ██      ██  ██  ██ ██      ██      ██  ██  ██    ██
 ███████ █████   ██ ██      ██      █████   ██    ██
      ██ ██  ██  ██ ██      ██      ██  ██  ██    ██
 ███████ ██   ██ ██ ███████ ███████ ██   ██ ██    ██
`.trim();

interface TerminalLine {
  type: 'cmd' | 'out';
  text: string;
}

const TERMINAL_LINES: TerminalLine[] = [
  { type: 'cmd', text: 'skillkit find react' },
  { type: 'out', text: '  ■ react-patterns     ★★★★★' },
  { type: 'out', text: '  ■ react-testing      ★★★★☆' },
  { type: 'cmd', text: 'skillkit install anthropics/skills' },
  { type: 'out', text: '→ 3 skills → 5 agents' },
  { type: 'cmd', text: 'skillkit ui' },
  { type: 'out', text: '→ Launching TUI...' },
  { type: 'cmd', text: 'skillkit check' },
  { type: 'out', text: '  ✓ All skills up to date' },
  { type: 'cmd', text: 'skillkit manifest install' },
  { type: 'out', text: '→ 12 skills from .skills' },
];

const FADE_ANIMATION_STYLES = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  .animate-fade-in-delay {
    animation: fade-in 0.6s ease-out 0.2s forwards;
    opacity: 0;
  }
`;

const CHECK_ICON = (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export function Hero(): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) {
      const resetTimer = setTimeout(() => {
        setVisibleLines(0);
        setTypingIndex(0);
        setCurrentText('');
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const line = TERMINAL_LINES[visibleLines];
    if (line.type === 'cmd') {
      if (typingIndex < line.text.length) {
        const timer = setTimeout(() => {
          setCurrentText(line.text.slice(0, typingIndex + 1));
          setTypingIndex(typingIndex + 1);
        }, 40);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        setVisibleLines(visibleLines + 1);
        setTypingIndex(0);
        setCurrentText('');
      }, 200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setVisibleLines(visibleLines + 1);
    }, 150);
    return () => clearTimeout(timer);
  }, [visibleLines, typingIndex]);

  async function copyInstall(): Promise<void> {
    try {
      await navigator.clipboard.writeText('npx skillkit@latest');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed, silently ignore
    }
  }

  function openGitHub(): void {
    window.open('https://github.com/rohitg00/skillkit', '_blank', 'noopener,noreferrer');
  }

  const isTyping = visibleLines < TERMINAL_LINES.length && TERMINAL_LINES[visibleLines].type === 'cmd';
  const isComplete = visibleLines >= TERMINAL_LINES.length;

  return (
    <div className="relative border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none"></div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative">
        <div className="hidden lg:block mb-6 overflow-hidden">
          <pre className="text-zinc-800 text-[8px] leading-none font-mono select-none animate-pulse">
            {ASCII_LOGO}
          </pre>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 px-2 py-0.5 mb-3 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 bg-white rounded-full"></span>
              <span className="text-xs font-mono text-zinc-400">v1.7.5</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 font-mono">
              Universal Skills for<br />
              <span className="text-zinc-500">AI Coding Agents</span>
            </h1>

            <p className="text-sm text-zinc-400 mb-5 max-w-lg font-mono leading-relaxed">
              One CLI to install, sync, and manage skills across Claude Code, Cursor,
              Windsurf, Copilot, and 28 more agents. 15,000+ skills ready to use.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={copyInstall}
                className="inline-flex items-center bg-black border border-zinc-700 px-3 py-2 hover:border-zinc-500 transition-colors"
              >
                <span className="text-zinc-500 mr-2 select-none">$</span>
                <span className="font-mono text-zinc-100 text-sm">npx skillkit@latest</span>
                <span className="ml-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                  {copied ? (
                    <>
                      {CHECK_ICON}
                      <span className="text-xs text-green-400">Copied!</span>
                    </>
                  ) : (
                    COPY_ICON
                  )}
                </span>
              </button>
              <Button variant="outline" onClick={openGitHub}>
                GITHUB
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative animate-fade-in-delay w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg opacity-20 blur-lg"></div>
            <div className="relative border border-zinc-800 bg-black rounded-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                <span className="ml-2 text-zinc-500 text-xs font-mono">skillkit</span>
              </div>
              <div className="p-4 font-mono text-xs min-h-[200px] max-h-[280px]">
                {TERMINAL_LINES.slice(0, visibleLines).map((line, index) => (
                  <div key={index} className="mb-1">
                    {line.type === 'cmd' ? (
                      <div className="flex items-center">
                        <span className="text-zinc-600 mr-2">$</span>
                        <span className="text-zinc-100">{line.text}</span>
                      </div>
                    ) : (
                      <div className="pl-4 text-zinc-500">
                        <span className="text-zinc-400">{line.text.slice(0, 1)}</span>
                        {line.text.slice(1)}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center">
                    <span className="text-zinc-600 mr-2">$</span>
                    <span className="text-zinc-100">{currentText}</span>
                    <span className="w-2 h-4 bg-zinc-400 ml-0.5 animate-pulse"></span>
                  </div>
                )}
                {isComplete && (
                  <div className="flex items-center mt-1">
                    <span className="text-zinc-600 mr-2">$</span>
                    <span className="w-2 h-4 bg-zinc-600 animate-pulse"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{FADE_ANIMATION_STYLES}</style>
    </div>
  );
}

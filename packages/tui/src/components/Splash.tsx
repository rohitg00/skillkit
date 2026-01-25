/**
 * Splash Component
 * Cinematic ASCII art intro with elegant animations
 * Premium terminal experience
 */
import { useState, useEffect, useMemo } from 'react';
import { terminalColors } from '../theme/colors.js';
import { getVersion } from '../utils/helpers.js';

// Premium ASCII art logo - clean geometric design
const LOGO_FRAMES = [
  // Frame 1 - Dots appear
  [
    '                                          ',
    '   ·  · ·  · · ·  · ·  · ·  · ·  · · ·   ',
    '                                          ',
  ],
  // Frame 2 - Lines form
  [
    '                                          ',
    '   ━━━  ━  ━  ━  ━     ━     ━  ━  ━━━   ',
    '                                          ',
  ],
  // Frame 3 - Structure emerges
  [
    '   ┌──┐ ┬ ┌─ ┬ ┬   ┬   ┬ ┌─ ┬ ┌─┐       ',
    '   └──┐ │ │  │ │   │   │ │  │  │        ',
    '   └──┘ ┴ └─ ┴ ┴─┘ ┴─┘ ┴ └─ ┴  ┴        ',
  ],
  // Frame 4 - Bold letters
  [
    '   ╔═╗ ╦╔═ ╦ ╦   ╦   ╦╔═ ╦╔╦╗            ',
    '   ╚═╗ ╠╩╗ ║ ║   ║   ╠╩╗ ║ ║             ',
    '   ╚═╝ ╩ ╩ ╩ ╩═╝ ╩═╝ ╩ ╩ ╩ ╩             ',
  ],
  // Frame 5 - Final premium logo
  [
    '   ███████╗██╗  ██╗██╗██╗     ██╗     ██╗  ██╗██╗████████╗',
    '   ██╔════╝██║ ██╔╝██║██║     ██║     ██║ ██╔╝██║╚══██╔══╝',
    '   ███████╗█████╔╝ ██║██║     ██║     █████╔╝ ██║   ██║   ',
    '   ╚════██║██╔═██╗ ██║██║     ██║     ██╔═██╗ ██║   ██║   ',
    '   ███████║██║  ██╗██║███████╗███████╗██║  ██╗██║   ██║   ',
    '   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ',
  ],
];

// Compact logo for smaller terminals
const LOGO_SMALL = [
  ' ╔═╗╦╔═╦╦  ╦  ╦╔═╦╔╦╗ ',
  ' ╚═╗╠╩╗║║  ║  ╠╩╗║ ║  ',
  ' ╚═╝╩ ╩╩╩═╝╩═╝╩ ╩╩ ╩  ',
];

// Elegant spinner frames
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Progress bar characters
const PROGRESS = {
  empty: '░',
  filled: '█',
  head: '▓',
};

// Loading phases with elegant messaging
const PHASES = [
  { message: 'Initializing', detail: 'skill engine' },
  { message: 'Connecting', detail: 'agent network' },
  { message: 'Loading', detail: 'skill manifests' },
  { message: 'Syncing', detail: 'configurations' },
  { message: 'Ready', detail: '' },
];

interface SplashProps {
  onComplete: () => void;
  duration?: number;
}

export function Splash({ onComplete, duration = 3500 }: SplashProps) {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [phase, setPhase] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [particles, setParticles] = useState<string[]>([]);

  const version = getVersion();
  const cols = process.stdout.columns || 80;
  const rows = process.stdout.rows || 24;
  const useSmallLogo = cols < 70;
  const currentLogo = useSmallLogo ? LOGO_SMALL : (LOGO_FRAMES[Math.min(frame, 4)] || LOGO_FRAMES[4]);
  const maxWidth = Math.max(...currentLogo.map(l => l.length));

  // Generate ambient particles
  const generateParticles = useMemo(() => {
    const chars = ['·', '∙', '•', '○', '◦', '◌', '◍', '◎'];
    return Array(cols).fill(0).map(() =>
      Math.random() > 0.97 ? chars[Math.floor(Math.random() * chars.length)] : ' '
    ).join('');
  }, [cols]);

  // Logo reveal animation
  useEffect(() => {
    if (frame >= 4) return;
    const timer = setTimeout(() => setFrame(f => f + 1), 200);
    return () => clearTimeout(timer);
  }, [frame]);

  // Fade in effect
  useEffect(() => {
    if (fadeIn >= 10) return;
    const timer = setTimeout(() => setFadeIn(f => f + 1), 50);
    return () => clearTimeout(timer);
  }, [fadeIn]);

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const newProgress = p + (Math.random() * 3 + 1);
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Phase progression
  useEffect(() => {
    const phaseProgress = progress / 20;
    setPhase(Math.min(Math.floor(phaseProgress), PHASES.length - 1));
  }, [progress]);

  // Spinner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev];
        if (newParticles.length > 3) newParticles.shift();
        newParticles.push(generateParticles);
        return newParticles;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [generateParticles]);

  // Auto-complete
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  // Centering
  const pad = ' '.repeat(Math.max(0, Math.floor((cols - maxWidth) / 2)));
  const progressWidth = Math.min(40, cols - 20);
  const progressPad = ' '.repeat(Math.max(0, Math.floor((cols - progressWidth) / 2)));

  // Progress bar
  const filledWidth = Math.floor((progress / 100) * progressWidth);
  const progressBar = PROGRESS.filled.repeat(filledWidth) +
    (filledWidth < progressWidth ? PROGRESS.head : '') +
    PROGRESS.empty.repeat(Math.max(0, progressWidth - filledWidth - 1));

  const currentPhase = PHASES[phase];

  return (
    <box flexDirection="column" height={rows}>
      {/* Top ambient particles */}
      <text fg={terminalColors.textMuted}>
        {particles[0] || ''}
      </text>

      {/* Spacer */}
      <box flexGrow={1} />

      {/* Logo */}
      <box flexDirection="column" alignItems="center">
        {currentLogo.map((line, idx) => (
          <text key={idx} fg={frame >= 4 ? terminalColors.accent : terminalColors.textMuted}>
            {frame >= 4 ? <b>{pad}{line}</b> : <>{pad}{line}</>}
          </text>
        ))}
      </box>

      {/* Tagline with fade-in */}
      <text> </text>
      {fadeIn > 3 && (
        <text fg={terminalColors.textSecondary}>
          {pad}{'  '}universal skills for ai coding agents
        </text>
      )}

      {/* Version badge */}
      {fadeIn > 5 && (
        <>
          <text> </text>
          <text fg={terminalColors.textMuted}>
            {pad}{'          '}v{version}
          </text>
        </>
      )}

      {/* Spacer */}
      <text> </text>
      <text> </text>

      {/* Progress section */}
      {fadeIn > 7 && (
        <box flexDirection="column" alignItems="center">
          {/* Status line */}
          <box flexDirection="row">
            <text fg={terminalColors.accent}>
              {progressPad}{SPINNER[spinnerFrame]}{' '}
            </text>
            <text fg={terminalColors.text}>
              <b>{currentPhase.message}</b>
            </text>
            {currentPhase.detail && (
              <text fg={terminalColors.textMuted}>
                {' '}{currentPhase.detail}
              </text>
            )}
          </box>

          {/* Progress bar */}
          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted}>{progressPad}[</text>
            <text fg={terminalColors.accent}>{progressBar}</text>
            <text fg={terminalColors.textMuted}>]</text>
            <text fg={terminalColors.textSecondary}>{' '}{Math.floor(progress)}%</text>
          </box>
        </box>
      )}

      {/* Spacer */}
      <box flexGrow={1} />

      {/* Bottom hint */}
      <box flexDirection="column" alignItems="center">
        <text fg={terminalColors.textMuted}>
          {progressPad}{'      '}press any key to skip
        </text>
        <text> </text>
        {/* Bottom particles */}
        <text fg={terminalColors.textMuted}>
          {particles[1] || ''}
        </text>
      </box>
    </box>
  );
}

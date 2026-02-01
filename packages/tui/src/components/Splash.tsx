import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { getVersion } from '../utils/helpers.js';

const LOGO_FRAMES = [
  [
    '                                          ',
    '   ·  · ·  · · ·  · ·  · ·  · ·  · · ·   ',
    '                                          ',
  ],
  [
    '                                          ',
    '   ━━━  ━  ━  ━  ━     ━     ━  ━  ━━━   ',
    '                                          ',
  ],
  [
    '   ┌──┐ ┬ ┌─ ┬ ┬   ┬   ┬ ┌─ ┬ ┌─┐       ',
    '   └──┐ │ │  │ │   │   │ │  │  │        ',
    '   └──┘ ┴ └─ ┴ ┴─┘ ┴─┘ ┴ └─ ┴  ┴        ',
  ],
  [
    '   ╔═╗ ╦╔═ ╦ ╦   ╦   ╦╔═ ╦╔╦╗            ',
    '   ╚═╗ ╠╩╗ ║ ║   ║   ╠╩╗ ║ ║             ',
    '   ╚═╝ ╩ ╩ ╩ ╩═╝ ╩═╝ ╩ ╩ ╩ ╩             ',
  ],
  [
    '   ███████╗██╗  ██╗██╗██╗     ██╗     ██╗  ██╗██╗████████╗',
    '   ██╔════╝██║ ██╔╝██║██║     ██║     ██║ ██╔╝██║╚══██╔══╝',
    '   ███████╗█████╔╝ ██║██║     ██║     █████╔╝ ██║   ██║   ',
    '   ╚════██║██╔═██╗ ██║██║     ██║     ██╔═██╗ ██║   ██║   ',
    '   ███████║██║  ██╗██║███████╗███████╗██║  ██╗██║   ██║   ',
    '   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ',
  ],
];

const LOGO_SMALL = [
  ' ╔═╗╦╔═╦╦  ╦  ╦╔═╦╔╦╗ ',
  ' ╚═╗╠╩╗║║  ║  ╠╩╗║ ║  ',
  ' ╚═╝╩ ╩╩╩═╝╩═╝╩ ╩╩ ╩  ',
];

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const PROGRESS = {
  empty: '░',
  filled: '█',
  head: '▓',
};

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

export function Splash(props: SplashProps) {
  const [frame, setFrame] = createSignal(0);
  const [progress, setProgress] = createSignal(0);
  const [spinnerFrame, setSpinnerFrame] = createSignal(0);
  const [phase, setPhase] = createSignal(0);
  const [fadeIn, setFadeIn] = createSignal(0);
  const [particles, setParticles] = createSignal<string[]>([]);

  const version = createMemo(() => getVersion());
  const cols = process.stdout.columns || 80;
  const rows = process.stdout.rows || 24;
  const useSmallLogo = cols < 70;

  const currentLogo = () => {
    return useSmallLogo ? LOGO_SMALL : (LOGO_FRAMES[Math.min(frame(), 4)] || LOGO_FRAMES[4]);
  };

  const maxWidth = () => Math.max(...currentLogo().map((l) => l.length));

  const generateParticles = () => {
    const chars = ['·', '∙', '•', '○', '◦', '◌', '◍', '◎'];
    return Array(cols)
      .fill(0)
      .map(() => (Math.random() > 0.97 ? chars[Math.floor(Math.random() * chars.length)] : ' '))
      .join('');
  };

  createEffect(() => {
    if (frame() >= 4) return;
    const timer = setTimeout(() => setFrame((f) => f + 1), 200);
    onCleanup(() => clearTimeout(timer));
  });

  createEffect(() => {
    if (fadeIn() >= 10) return;
    const timer = setTimeout(() => setFadeIn((f) => f + 1), 50);
    onCleanup(() => clearTimeout(timer));
  });

  createEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + (Math.random() * 3 + 1);
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 50);
    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    const phaseProgress = progress() / 20;
    setPhase(Math.min(Math.floor(phaseProgress), PHASES.length - 1));
  });

  createEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER.length);
    }, 80);
    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const newParticles = [...prev];
        if (newParticles.length > 3) newParticles.shift();
        newParticles.push(generateParticles());
        return newParticles;
      });
    }, 150);
    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    const timer = setTimeout(props.onComplete, props.duration ?? 3500);
    onCleanup(() => clearTimeout(timer));
  });

  const pad = () => ' '.repeat(Math.max(0, Math.floor((cols - maxWidth()) / 2)));
  const progressWidth = Math.max(1, Math.min(40, cols - 20));
  const progressPad = ' '.repeat(Math.max(0, Math.floor((cols - progressWidth) / 2)));

  const filledWidth = () => Math.min(Math.floor((progress() / 100) * progressWidth), progressWidth);
  const emptyWidth = () => Math.max(0, progressWidth - filledWidth() - 1);
  const progressBar = () =>
    PROGRESS.filled.repeat(filledWidth()) +
    (filledWidth() < progressWidth ? PROGRESS.head : '') +
    PROGRESS.empty.repeat(emptyWidth());

  const currentPhase = () => PHASES[phase()];

  return (
    <box flexDirection="column" height={rows}>
      <text fg={terminalColors.textMuted}>{particles()[0] || ''}</text>

      <box flexGrow={1} />

      <box flexDirection="column" alignItems="center">
        <For each={currentLogo()}>
          {(line, idx) => (
            <text fg={frame() >= 4 ? terminalColors.accent : terminalColors.textMuted}>
              {frame() >= 4 ? (
                <b>
                  {pad()}
                  {line}
                </b>
              ) : (
                <>
                  {pad()}
                  {line}
                </>
              )}
            </text>
          )}
        </For>
      </box>

      <text> </text>
      <Show when={fadeIn() > 3}>
        <text fg={terminalColors.textSecondary}>
          {pad()}
          {'  '}universal skills for ai coding agents
        </text>
      </Show>

      <Show when={fadeIn() > 5}>
        <text> </text>
        <text fg={terminalColors.textMuted}>
          {pad()}
          {'          '}v{version()}
        </text>
      </Show>

      <text> </text>
      <text> </text>

      <Show when={fadeIn() > 7}>
        <box flexDirection="column" alignItems="center">
          <box flexDirection="row">
            <text fg={terminalColors.accent}>
              {progressPad}
              {SPINNER[spinnerFrame()]}{' '}
            </text>
            <text fg={terminalColors.text}>
              <b>{currentPhase().message}</b>
            </text>
            <Show when={currentPhase().detail}>
              <text fg={terminalColors.textMuted}> {currentPhase().detail}</text>
            </Show>
          </box>

          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted}>{progressPad}[</text>
            <text fg={terminalColors.accent}>{progressBar()}</text>
            <text fg={terminalColors.textMuted}>]</text>
            <text fg={terminalColors.textSecondary}> {Math.floor(progress())}%</text>
          </box>
        </box>
      </Show>

      <box flexGrow={1} />

      <box flexDirection="column" alignItems="center">
        <text fg={terminalColors.textMuted}>
          {progressPad}
          {'      '}press any key to skip
        </text>
        <text> </text>
        <text fg={terminalColors.textMuted}>{particles()[1] || ''}</text>
      </box>
    </box>
  );
}

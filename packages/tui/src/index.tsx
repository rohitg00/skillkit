import { createCliRenderer } from '@opentui/core';
import { render } from '@opentui/solid';
import { App } from './App.js';

let isRunning = true;
let renderer: Awaited<ReturnType<typeof createCliRenderer>> | null = null;

export function exitTUI(code = 0): void {
  if (!isRunning) return;
  isRunning = false;

  try {
    if (renderer && 'dispose' in renderer) {
      (renderer as { dispose?: () => void }).dispose?.();
    }
  } catch {}

  try {
    process.stdout.write('\x1b[?1049l\x1b[?25h\x1b[0m\x1b[H\x1b[2J');
  } catch {}

  setImmediate(() => process.exit(code));
}

export async function startTUI(): Promise<never> {
  process.on('SIGINT', () => exitTUI(0));
  process.on('SIGTERM', () => exitTUI(0));
  process.on('uncaughtException', (err) => {
    console.error('TUI Error:', err.message);
    exitTUI(1);
  });
  process.on('unhandledRejection', (err) => {
    console.error('TUI Error:', err);
    exitTUI(1);
  });

  renderer = await createCliRenderer({
    exitOnCtrlC: false,
    useMouse: true,
    enableMouseMovement: true,
  });

  try {
    await render(() => <App onExit={exitTUI} />, renderer);
  } catch (err) {
    console.error('Render failed:', err);
    exitTUI(1);
  }

  return new Promise(() => {});
}

export { type Screen } from './state/types.js';
export { App } from './App.js';
export * from './theme/index.js';
export * from './state/index.js';
export * from './utils/index.js';
export * from './components/index.js';
export * from './screens/index.js';

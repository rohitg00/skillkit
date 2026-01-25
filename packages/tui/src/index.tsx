import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { App } from './App.js';

export function exitTUI(code = 0): void {
  try {
    process.stdout.write('\x1b[?1049l\x1b[?25h\x1b[0m');
  } catch {
    // Ignore write errors
  }
  process.exit(code);
}

export async function startTUI(): Promise<never> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  const root = createRoot(renderer);
  root.render(<App onExit={exitTUI} />);
  return new Promise(() => {});
}

export { type Screen } from './state/types.js';
export { App } from './App.js';
export * from './theme/index.js';
export * from './state/index.js';
export * from './utils/index.js';
export * from './components/index.js';
export * from './screens/index.js';

import { render } from 'ink';
import { App } from './App.js';

export function startTUI(): Promise<void> {
  process.stdout.write('\x1B[2J\x1B[0f');

  const { waitUntilExit, clear } = render(<App />, {
    exitOnCtrlC: true,
  });

  return waitUntilExit().then(() => {
    clear();
  });
}

// Re-export types and components for external use
export type { Screen } from './App.js';
export { App } from './App.js';
export * from './components/index.js';
export * from './screens/index.js';
export * from './hooks/index.js';
export * from './theme.js';

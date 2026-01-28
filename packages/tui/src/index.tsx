import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { App } from './App.js';

let rootInstance: ReturnType<typeof createRoot> | null = null;

export function exitTUI(code = 0): void {
  try {
    // Unmount React tree first
    if (rootInstance) {
      try {
        rootInstance.unmount();
      } catch {
        // Ignore unmount errors
      }
      rootInstance = null;
    }

    // Restore terminal state: exit alt screen, show cursor, reset attributes, clear
    process.stdout.write('\x1b[?1049l\x1b[?25h\x1b[0m\x1b[H\x1b[2J');
  } catch {
    // Ignore write errors
  }

  // Use setImmediate to allow any pending operations to complete
  setImmediate(() => process.exit(code));
}

export async function startTUI(): Promise<never> {
  // Setup signal handlers for clean exit
  const handleSignal = () => exitTUI(0);
  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);

  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  rootInstance = createRoot(renderer);
  rootInstance.render(<App onExit={exitTUI} />);
  return new Promise(() => {});
}

export { type Screen } from './state/types.js';
export { App } from './App.js';
export * from './theme/index.js';
export * from './state/index.js';
export * from './utils/index.js';
export * from './components/index.js';
export * from './screens/index.js';

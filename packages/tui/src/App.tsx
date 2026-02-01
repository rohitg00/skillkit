import { createSignal, createEffect, onCleanup, Show, Switch, Match } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { execFile } from 'node:child_process';
import { type Screen, NAV_KEYS } from './state/types.js';
import { Splash } from './components/Splash.js';
import { Sidebar } from './components/Sidebar.js';
import { StatusBar } from './components/StatusBar.js';
import {
  Home, Browse, Installed, Marketplace, Settings, Recommend,
  Translate, Context, Memory, Team, Plugins, Methodology,
  Plan, Workflow, Execute, History, Sync, Help, Mesh, Message,
} from './screens/index.js';

const DOCS_URL = 'https://agenstskills.com/docs';

function openUrl(url: string): void {
  if (process.platform === 'win32') {
    execFile('cmd', ['/c', 'start', '', url]);
  } else {
    const cmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
    execFile(cmd, [url]);
  }
}

interface AppProps {
  onExit?: (code?: number) => void;
}

export function App(props: AppProps) {
  const [showSplash, setShowSplash] = createSignal(true);
  const [currentScreen, setCurrentScreen] = createSignal<Screen>('home');
  const [showSidebar, setShowSidebar] = createSignal(true);
  const [dimensions, setDimensions] = createSignal({
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  });

  createEffect(() => {
    const handleResize = () => {
      setDimensions({
        cols: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
      });
    };
    process.stdout.on('resize', handleResize);
    onCleanup(() => {
      process.stdout.off('resize', handleResize);
    });
  });

  const cols = () => dimensions().cols;
  const rows = () => dimensions().rows;
  const sidebarVisible = () => showSidebar() && cols() >= 80;
  const sidebarWidth = () => {
    if (!sidebarVisible()) return 0;
    if (cols() >= 100) return 24;
    return 18;
  };
  const statusBarHeight = 2;
  const contentHeight = () => rows() - statusBarHeight;

  const handleNavigate = (newScreen: Screen) => {
    setCurrentScreen(newScreen);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useKeyboard((key: { name?: string; ctrl?: boolean; sequence?: string }) => {
    if (showSplash()) {
      setShowSplash(false);
      return;
    }

    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      props.onExit ? props.onExit(0) : process.exit(0);
      return;
    }

    if (key.name === 'd') {
      openUrl(DOCS_URL);
      return;
    }

    if (key.sequence === '\\') {
      setShowSidebar((v) => !v);
      return;
    }

    const targetScreen = NAV_KEYS[key.name || ''];
    if (targetScreen) {
      setCurrentScreen(targetScreen);
    }

    if (key.name === 'escape' && currentScreen() !== 'home') {
      setCurrentScreen('home');
    }
  });

  const screenProps = () => ({
    onNavigate: handleNavigate,
    cols: Math.max(1, cols() - sidebarWidth() - 2),
    rows: Math.max(1, contentHeight() - 1),
  });

  return (
    <Show when={!showSplash()} fallback={<Splash onComplete={handleSplashComplete} duration={3000} />}>
      <box flexDirection="column" height={rows()}>
        <box flexDirection="row" height={contentHeight()}>
          <Show when={sidebarVisible()}>
            <Sidebar
              screen={currentScreen()}
              onNavigate={handleNavigate}
            />
          </Show>

          <box flexDirection="column" flexGrow={1} paddingX={1}>
            <Switch fallback={<Home {...screenProps()} />}>
              <Match when={currentScreen() === 'home'}><Home {...screenProps()} /></Match>
              <Match when={currentScreen() === 'browse'}><Browse {...screenProps()} /></Match>
              <Match when={currentScreen() === 'installed'}><Installed {...screenProps()} /></Match>
              <Match when={currentScreen() === 'marketplace'}><Marketplace {...screenProps()} /></Match>
              <Match when={currentScreen() === 'settings'}><Settings {...screenProps()} /></Match>
              <Match when={currentScreen() === 'recommend'}><Recommend {...screenProps()} /></Match>
              <Match when={currentScreen() === 'translate'}><Translate {...screenProps()} /></Match>
              <Match when={currentScreen() === 'context'}><Context {...screenProps()} /></Match>
              <Match when={currentScreen() === 'memory'}><Memory {...screenProps()} /></Match>
              <Match when={currentScreen() === 'team'}><Team {...screenProps()} /></Match>
              <Match when={currentScreen() === 'plugins'}><Plugins {...screenProps()} /></Match>
              <Match when={currentScreen() === 'methodology'}><Methodology {...screenProps()} /></Match>
              <Match when={currentScreen() === 'plan'}><Plan {...screenProps()} /></Match>
              <Match when={currentScreen() === 'workflow'}><Workflow {...screenProps()} /></Match>
              <Match when={currentScreen() === 'execute'}><Execute {...screenProps()} /></Match>
              <Match when={currentScreen() === 'history'}><History {...screenProps()} /></Match>
              <Match when={currentScreen() === 'sync'}><Sync {...screenProps()} /></Match>
              <Match when={currentScreen() === 'help'}><Help {...screenProps()} /></Match>
              <Match when={currentScreen() === 'mesh'}><Mesh {...screenProps()} /></Match>
              <Match when={currentScreen() === 'message'}><Message {...screenProps()} /></Match>
            </Switch>
          </box>
        </box>

        <StatusBar />
      </box>
    </Show>
  );
}

export { type Screen };

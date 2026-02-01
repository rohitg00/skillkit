import { createSignal, createEffect, onCleanup, Show, Switch, Match, onMount } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { exec } from 'node:child_process';
import { type Screen, NAV_KEYS } from './state/types.js';
import { ThemeProvider, useTheme } from './context/theme.js';
import { KeybindProvider, useKeybinds } from './context/keybind.js';
import { ToastProvider, useToast } from './context/toast.js';
import { DialogProvider, useDialog } from './context/dialog.js';
import { CommandProvider, useCommand } from './context/command.js';
import { RouteProvider, useRoute } from './context/route.js';
import { SidebarProvider, useSidebar } from './context/sidebar.js';
import { Splash } from './components/Splash.js';
import { RightSidebar } from './components/RightSidebar.js';
import { BottomStatusBar } from './components/BottomStatusBar.js';
import { ToastContainer } from './ui/toast.js';
import { DialogOverlay } from './ui/dialog.js';
import { CommandPalette } from './ui/command-palette.js';
import { ThemePicker } from './ui/theme-picker.js';
import {
  Home, Browse, Installed, Marketplace, Settings, Recommend,
  Translate, Context, Memory, Team, Plugins, Methodology,
  Plan, Workflow, Execute, History, Sync, Help, Mesh, Message,
} from './screens/index.js';

const DOCS_URL = 'https://agenstskills.com/docs';

function openUrl(url: string): void {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} ${url}`);
}

interface AppShellProps {
  onExit?: (code?: number) => void;
}

function AppShell(props: AppShellProps) {
  const [showSplash, setShowSplash] = createSignal(true);
  const [showThemePicker, setShowThemePicker] = createSignal(false);
  const [dimensions, setDimensions] = createSignal({
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  });

  const { currentScreen, navigate } = useRoute();
  const { colors, setTheme, availableThemes } = useTheme();
  const { getActionForKey } = useKeybinds();
  const { isOpen: commandOpen, open: openCommand, close: closeCommand, selectNext: cmdNext, selectPrev: cmdPrev, execute: cmdExec, setQuery } = useCommand();
  const { state: dialogState, selectNext: dlgNext, selectPrev: dlgPrev, submit: dlgSubmit, close: dlgClose } = useDialog();
  const { visible: sidebarVisible, toggleVisible: toggleSidebar, setFocused: setSidebarFocused } = useSidebar();
  const toast = useToast();

  const registerCommands = () => {
    const { registerCommand } = useCommand();

    registerCommand({ id: 'nav-home', label: 'Home', shortcut: 'h', category: 'Navigation', action: () => navigate('home') });
    registerCommand({ id: 'nav-browse', label: 'Browse Skills', shortcut: 'b', category: 'Navigation', action: () => navigate('browse') });
    registerCommand({ id: 'nav-marketplace', label: 'Marketplace', shortcut: 'm', category: 'Navigation', action: () => navigate('marketplace') });
    registerCommand({ id: 'nav-installed', label: 'Installed', shortcut: 'i', category: 'Navigation', action: () => navigate('installed') });
    registerCommand({ id: 'nav-recommend', label: 'Recommend', shortcut: 'r', category: 'Navigation', action: () => navigate('recommend') });
    registerCommand({ id: 'nav-translate', label: 'Translate', shortcut: 't', category: 'Navigation', action: () => navigate('translate') });
    registerCommand({ id: 'nav-sync', label: 'Sync', shortcut: 's', category: 'Navigation', action: () => navigate('sync') });
    registerCommand({ id: 'nav-workflow', label: 'Workflow', shortcut: 'w', category: 'Navigation', action: () => navigate('workflow') });
    registerCommand({ id: 'nav-execute', label: 'Execute', shortcut: 'x', category: 'Navigation', action: () => navigate('execute') });
    registerCommand({ id: 'nav-team', label: 'Team', shortcut: 'a', category: 'Navigation', action: () => navigate('team') });
    registerCommand({ id: 'nav-plugins', label: 'Plugins', shortcut: 'p', category: 'Navigation', action: () => navigate('plugins') });
    registerCommand({ id: 'nav-methodology', label: 'Methodology', shortcut: 'o', category: 'Navigation', action: () => navigate('methodology') });
    registerCommand({ id: 'nav-plan', label: 'Plan', shortcut: 'n', category: 'Navigation', action: () => navigate('plan') });
    registerCommand({ id: 'nav-context', label: 'Context', shortcut: 'c', category: 'Navigation', action: () => navigate('context') });
    registerCommand({ id: 'nav-memory', label: 'Memory', shortcut: 'e', category: 'Navigation', action: () => navigate('memory') });
    registerCommand({ id: 'nav-settings', label: 'Settings', category: 'Navigation', action: () => navigate('settings') });
    registerCommand({ id: 'nav-help', label: 'Help', shortcut: '?', category: 'Navigation', action: () => navigate('help') });
    registerCommand({ id: 'action-theme', label: 'Change Theme', shortcut: 'Ctrl+t', category: 'Actions', action: () => setShowThemePicker(true) });
    registerCommand({ id: 'action-docs', label: 'Open Documentation', shortcut: 'd', category: 'Actions', action: () => openUrl(DOCS_URL) });
    registerCommand({ id: 'action-quit', label: 'Quit', shortcut: 'q', category: 'Actions', action: () => props.onExit?.(0) });
  };

  onMount(() => {
    registerCommands();
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
  const showSidebar = () => sidebarVisible() && cols() >= 80;
  const sidebarWidth = () => {
    if (!showSidebar()) return 0;
    if (cols() >= 100) return 26;
    return 20;
  };
  const statusBarHeight = 2;
  const contentHeight = () => rows() - statusBarHeight;

  const handleNavigate = (newScreen: Screen) => {
    navigate(newScreen);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useKeyboard((key: { name?: string; ctrl?: boolean; sequence?: string }) => {
    if (showSplash()) {
      setShowSplash(false);
      return;
    }

    // Handle theme picker
    if (showThemePicker()) {
      if (key.name === 'escape') {
        setShowThemePicker(false);
        return;
      }
      return;
    }

    // Handle command palette
    if (commandOpen()) {
      if (key.name === 'escape') {
        closeCommand();
        return;
      }
      if (key.name === 'return') {
        cmdExec();
        return;
      }
      if (key.name === 'up' || key.name === 'k') {
        cmdPrev();
        return;
      }
      if (key.name === 'down' || key.name === 'j') {
        cmdNext();
        return;
      }
      if (key.name === 'backspace') {
        setQuery((prev: string) => prev.slice(0, -1));
        return;
      }
      if (key.sequence && key.sequence.length === 1 && !key.ctrl) {
        setQuery((prev: string) => prev + key.sequence);
        return;
      }
      return;
    }

    // Handle dialog
    if (dialogState().isOpen) {
      if (key.name === 'escape') {
        dlgClose(null);
        return;
      }
      if (key.name === 'return') {
        dlgSubmit();
        return;
      }
      if (key.name === 'left' || key.name === 'h') {
        dlgPrev();
        return;
      }
      if (key.name === 'right' || key.name === 'l') {
        dlgNext();
        return;
      }
      return;
    }

    // Global shortcuts
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      props.onExit?.(0);
      return;
    }

    if (key.name === '/') {
      openCommand();
      return;
    }

    if (key.ctrl && key.name === 't') {
      setShowThemePicker(true);
      return;
    }

    if (key.name === 'd') {
      openUrl(DOCS_URL);
      return;
    }

    if (key.sequence === '\\') {
      toggleSidebar();
      return;
    }

    const targetScreen = NAV_KEYS[key.name || ''];
    if (targetScreen) {
      navigate(targetScreen);
    }

    if (key.name === 'escape' && currentScreen() !== 'home') {
      navigate('home');
    }
  });

  const screenProps = () => ({
    onNavigate: handleNavigate,
    cols: cols() - sidebarWidth() - 2,
    rows: contentHeight() - 1,
  });

  return (
    <Show when={!showSplash()} fallback={<Splash onComplete={handleSplashComplete} duration={3000} />}>
      <box flexDirection="column" height={rows()}>
        <box flexDirection="row" height={contentHeight()}>
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

          <Show when={showSidebar()}>
            <RightSidebar width={sidebarWidth()} rows={contentHeight()} />
          </Show>
        </box>

        <BottomStatusBar currentScreen={currentScreen()} width={cols()} />

        <ToastContainer />
        <CommandPalette />
        <DialogOverlay />
        <ThemePicker isOpen={showThemePicker()} onClose={() => setShowThemePicker(false)} />
      </box>
    </Show>
  );
}

interface AppProps {
  onExit?: (code?: number) => void;
}

export function App(props: AppProps) {
  return (
    <ThemeProvider>
      <KeybindProvider>
        <ToastProvider>
          <DialogProvider>
            <CommandProvider>
              <RouteProvider>
                <SidebarProvider>
                  <AppShell onExit={props.onExit} />
                </SidebarProvider>
              </RouteProvider>
            </CommandProvider>
          </DialogProvider>
        </ToastProvider>
      </KeybindProvider>
    </ThemeProvider>
  );
}

export { type Screen };

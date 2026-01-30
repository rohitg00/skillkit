import { useState, useCallback, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { exec } from 'node:child_process';
import { type Screen, NAV_KEYS } from './state/types.js';
import { Sidebar } from './components/Sidebar.js';
import { Splash } from './components/Splash.js';
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

interface AppProps {
  onExit?: (code?: number) => void;
}

export function App({ onExit }: AppProps = {}) {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>('home');
  const [dimensions, setDimensions] = useState({
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        cols: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
      });
    };
    process.stdout.on('resize', handleResize);
    return () => { process.stdout.off('resize', handleResize); };
  }, []);

  const { cols, rows } = dimensions;
  const showSidebar = cols >= 60;

  const handleNavigate = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  useKeyboard((key: { name?: string; ctrl?: boolean }) => {
    if (showSplash) {
      setShowSplash(false);
      return;
    }

    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      onExit ? onExit(0) : process.exit(0);
      return;
    }

    if (key.name === 'd') {
      openUrl(DOCS_URL);
      return;
    }

    const targetScreen = NAV_KEYS[key.name || ''];
    if (targetScreen) {
      setScreen(targetScreen);
    }

    if (key.name === 'escape' && screen !== 'home') {
      setScreen('home');
    }
  });

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} duration={3000} />;
  }

  const screenProps = {
    onNavigate: handleNavigate,
    cols: cols - (showSidebar ? 20 : 0),
    rows,
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <Home {...screenProps} />;
      case 'browse': return <Browse {...screenProps} />;
      case 'installed': return <Installed {...screenProps} />;
      case 'marketplace': return <Marketplace {...screenProps} />;
      case 'settings': return <Settings {...screenProps} />;
      case 'recommend': return <Recommend {...screenProps} />;
      case 'translate': return <Translate {...screenProps} />;
      case 'context': return <Context {...screenProps} />;
      case 'memory': return <Memory {...screenProps} />;
      case 'team': return <Team {...screenProps} />;
      case 'plugins': return <Plugins {...screenProps} />;
      case 'methodology': return <Methodology {...screenProps} />;
      case 'plan': return <Plan {...screenProps} />;
      case 'workflow': return <Workflow {...screenProps} />;
      case 'execute': return <Execute {...screenProps} />;
      case 'history': return <History {...screenProps} />;
      case 'sync': return <Sync {...screenProps} />;
      case 'help': return <Help {...screenProps} />;
      case 'mesh': return <Mesh {...screenProps} />;
      case 'message': return <Message {...screenProps} />;
      default: return <Home {...screenProps} />;
    }
  };

  return (
    <box flexDirection="row" height={rows}>
      {showSidebar && <Sidebar screen={screen} onNavigate={handleNavigate} />}
      <box flexDirection="column" flexGrow={1} marginLeft={showSidebar ? 1 : 0} paddingRight={1}>
        {renderScreen()}
      </box>
    </box>
  );
}

export { type Screen };

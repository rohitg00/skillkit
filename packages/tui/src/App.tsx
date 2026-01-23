import { useState } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { Sidebar } from './components/Sidebar.js';
import { Home } from './screens/Home.js';
import { Browse } from './screens/Browse.js';
import { Installed } from './screens/Installed.js';
import { Sync } from './screens/Sync.js';
import { Settings } from './screens/Settings.js';
import { Recommend } from './screens/Recommend.js';
import { Translate } from './screens/Translate.js';
import { Context } from './screens/Context.js';
import { Workflow } from './screens/Workflow.js';
import { Execute } from './screens/Execute.js';
import { History } from './screens/History.js';
import { Marketplace } from './screens/Marketplace.js';
import { Memory } from './screens/Memory.js';

export type Screen = 'home' | 'browse' | 'installed' | 'sync' | 'settings' | 'recommend' | 'translate' | 'context' | 'workflow' | 'execute' | 'history' | 'marketplace' | 'memory';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const { exit } = useApp();
  const { stdout } = useStdout();

  const cols = stdout?.columns || 80;
  const rows = stdout?.rows || 24;
  const showSidebar = cols >= 70;

  const NAV_KEYS: Record<string, Screen> = {
    h: 'home',
    m: 'marketplace',
    b: 'browse',
    w: 'workflow',
    x: 'execute',
    y: 'history',
    r: 'recommend',
    t: 'translate',
    c: 'context',
    e: 'memory',
    i: 'installed',
    s: 'sync',
    ',': 'settings',
  };

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (key.escape) {
      setScreen('home');
      return;
    }
    const targetScreen = NAV_KEYS[input];
    if (targetScreen) {
      setScreen(targetScreen);
    }
  });

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <Home onNavigate={setScreen} cols={cols} rows={rows} />;
      case 'browse': return <Browse cols={cols} rows={rows} />;
      case 'installed': return <Installed cols={cols} rows={rows} />;
      case 'sync': return <Sync cols={cols} rows={rows} />;
      case 'settings': return <Settings cols={cols} rows={rows} />;
      case 'recommend': return <Recommend cols={cols} rows={rows} />;
      case 'translate': return <Translate cols={cols} rows={rows} />;
      case 'context': return <Context cols={cols} rows={rows} />;
      case 'workflow': return <Workflow cols={cols} rows={rows} />;
      case 'execute': return <Execute cols={cols} rows={rows} />;
      case 'history': return <History cols={cols} rows={rows} />;
      case 'marketplace': return <Marketplace cols={cols} rows={rows} />;
      case 'memory': return <Memory cols={cols} rows={rows} />;
    }
  };

  const contentHeight = rows - 2;

  return (
    <Box flexDirection="column" height={rows}>
      <Box flexDirection="row" height={contentHeight}>
        {showSidebar && <Sidebar screen={screen} onNavigate={setScreen} />}
        <Box flexDirection="column" flexGrow={1} marginLeft={1}>
          {renderScreen()}
        </Box>
      </Box>
      <Box>
        <Text dimColor>h Home  m Market  b Browse  i Inst  w Wflow  x Exec  y Hist  r Rec  t Trans  c Ctx  e Mem  s Sync  , Cfg  q Quit</Text>
      </Box>
    </Box>
  );
}

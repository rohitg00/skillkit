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

export type Screen = 'home' | 'browse' | 'installed' | 'sync' | 'settings' | 'recommend' | 'translate' | 'context';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const { exit } = useApp();
  const { stdout } = useStdout();

  const cols = stdout?.columns || 80;
  const rows = stdout?.rows || 24;
  const showSidebar = cols >= 70;

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (key.escape) {
      setScreen('home');
      return;
    }
    if (input === 'h') setScreen('home');
    if (input === 'b') setScreen('browse');
    if (input === 'l') setScreen('installed');
    if (input === 's') setScreen('sync');
    if (input === ',') setScreen('settings');
    if (input === 'r') setScreen('recommend');
    if (input === 't') setScreen('translate');
    if (input === 'c') setScreen('context');
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
        <Text dimColor>h Home  b Browse  r Rec  t Trans  c Ctx  l List  s Sync  , Config  q Quit</Text>
      </Box>
    </Box>
  );
}

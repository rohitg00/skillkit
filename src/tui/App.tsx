import React, { useState } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { Sidebar } from './components/Sidebar.js';
import { Home } from './screens/Home.js';
import { Browse } from './screens/Browse.js';
import { Installed } from './screens/Installed.js';
import { Sync } from './screens/Sync.js';
import { Settings } from './screens/Settings.js';

export type Screen = 'home' | 'browse' | 'installed' | 'sync' | 'settings';

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
  });

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <Home onNavigate={setScreen} cols={cols} rows={rows} />;
      case 'browse': return <Browse cols={cols} rows={rows} />;
      case 'installed': return <Installed cols={cols} rows={rows} />;
      case 'sync': return <Sync cols={cols} rows={rows} />;
      case 'settings': return <Settings cols={cols} rows={rows} />;
    }
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" flexGrow={1}>
        {showSidebar && <Sidebar screen={screen} onNavigate={setScreen} />}
        <Box flexDirection="column" flexGrow={1} marginLeft={1}>
          {renderScreen()}
        </Box>
      </Box>
      <Text dimColor>h Home  b Browse  l List  s Sync  , Config  Esc Back  q Quit</Text>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Box, Text } from 'ink';
import { colors, logo } from '../theme.js';
import type { Screen } from '../App.js';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const CHARS = '01█▓▒░╔╗╚╝║═';

const logoSmall = `
╔═╗╦╔═╦╦  ╦  ╦╔═╦╔╦╗
╚═╗╠╩╗║║  ║  ╠╩╗║ ║ 
╚═╝╩ ╩╩╩═╝╩═╝╩ ╩╩ ╩ 
`.trim();

function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = join(__dirname, '../../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '1.2.0';
  } catch {
    return '1.2.0';
  }
}

function scramble(target: string, progress: number): string {
  return target.split('\n').map(line => {
    return line.split('').map((char, i) => {
      if (char === ' ') return char;
      if (progress > (i / line.length) * 100) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
  }).join('\n');
}

export function Home({ cols = 80, rows = 24 }: HomeProps) {
  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState('');
  const version = getVersion();

  const useLogo = cols < 80 ? logoSmall : logo;

  useEffect(() => {
    if (progress >= 100) {
      setDisplay(useLogo);
      return;
    }
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + 12;
        setDisplay(scramble(useLogo, next));
        return next;
      });
    }, 35);
    return () => clearInterval(t);
  }, [progress, useLogo]);

  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>{display || useLogo}</Text>

      <Box marginTop={1}>
        <Text>Manage AI agent skills from your terminal.</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Quick Actions:</Text>
        <Text dimColor>  [b] Browse skills marketplace</Text>
        <Text dimColor>  [l] View installed skills</Text>
        <Text dimColor>  [s] Sync skills across agents</Text>
        <Text dimColor>  [,] Settings</Text>
      </Box>

      {rows >= 18 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Navigation:</Text>
          <Text dimColor>  ↑↓    Navigate lists</Text>
          <Text dimColor>  Enter Select / Confirm</Text>
          <Text dimColor>  Esc   Go back / Home</Text>
          <Text dimColor>  q     Quit</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>v{version} - Works with 17 AI agents</Text>
      </Box>
    </Box>
  );
}

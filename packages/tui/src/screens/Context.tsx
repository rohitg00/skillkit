/**
 * Context Screen
 * Project context analysis
 */
import { useState, useEffect } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';

interface ContextProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Context({ onNavigate, cols = 80, rows = 24 }: ContextProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const contextInfo = [
    { label: 'Working Directory', value: process.cwd() },
    { label: 'Node Version', value: process.version },
    { label: 'Platform', value: process.platform },
    { label: 'Architecture', value: process.arch },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Project Context"
        subtitle="Analyze your project environment"
        icon="&#x25C9;"
      />

      {loading ? (
        <Spinner label="Analyzing project context..." />
      ) : (
        <box flexDirection="column">
          {contextInfo.map((info) => (
            <box key={info.label} flexDirection="row" marginBottom={1}>
              <text fg={terminalColors.textMuted} width={20}>
                {info.label}:
              </text>
              <text fg={terminalColors.text}>{info.value}</text>
            </box>
          ))}
        </box>
      )}
    </box>
  );
}

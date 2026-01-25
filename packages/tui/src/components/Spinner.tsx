/**
 * Spinner Component
 * Loading indicator with animated frames
 */
import { useState, useEffect } from 'react';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';

interface SpinnerProps {
  label?: string;
  color?: keyof typeof terminalColors;
}

export function Spinner({ label, color = 'accent' }: SpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % symbols.spinner.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <box flexDirection="row" gap={1}>
      <text fg={terminalColors[color]}>{symbols.spinner[frame]}</text>
      {label && <text fg={terminalColors.text}>{label}</text>}
    </box>
  );
}

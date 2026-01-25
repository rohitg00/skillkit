/**
 * StatsCard Component
 * OpenSync-style stats display with optional animations
 */
import { useState, useEffect } from 'react';
import { terminalColors } from '../theme/colors.js';
import { animations } from '../theme/animations.js';

interface StatItem {
  label: string;
  value: number;
  color?: keyof typeof terminalColors;
}

interface StatsCardProps {
  items: StatItem[];
  animated?: boolean;
}

export function StatsCard({ items, animated = true }: StatsCardProps) {
  const [displayValues, setDisplayValues] = useState<number[]>(
    animated ? items.map(() => 0) : items.map((item) => item.value)
  );
  const [animComplete, setAnimComplete] = useState(!animated);

  useEffect(() => {
    if (!animated || animComplete) return;

    const duration = animations.countUp.duration;
    const startTime = Date.now();
    const targetValues = items.map((item) => item.value);
    const frameInterval = 16; // ~60fps

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);

      const newValues = targetValues.map((target) =>
        Math.round(target * eased)
      );

      setDisplayValues(newValues);

      if (progress >= 1) {
        clearInterval(intervalId);
        setAnimComplete(true);
      }
    }, frameInterval);

    return () => clearInterval(intervalId);
  }, [animated, animComplete, items]);

  return (
    <box flexDirection="row" gap={2}>
      {items.map((item, index) => {
        const fg = item.color
          ? terminalColors[item.color]
          : terminalColors.text;

        return (
          <box
            key={item.label}
            flexDirection="column"
            alignItems="center"
            padding={2}
            borderStyle="single"
            borderColor={terminalColors.border}
          >
            <text fg={fg}>
              <b>{String(displayValues[index])}</b>
            </text>
            <text fg={terminalColors.textMuted}>{item.label}</text>
          </box>
        );
      })}
    </box>
  );
}

import { createSignal, createEffect, onCleanup, For } from 'solid-js';
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

export function StatsCard(props: StatsCardProps) {
  const animated = () => props.animated ?? true;

  const [displayValues, setDisplayValues] = createSignal<number[]>(
    animated() ? props.items.map(() => 0) : props.items.map((item) => item.value)
  );
  const [animComplete, setAnimComplete] = createSignal(!animated());

  createEffect(() => {
    const newValues = animated() ? props.items.map(() => 0) : props.items.map((item) => item.value);
    setDisplayValues(newValues);
    setAnimComplete(!animated());
  });

  createEffect(() => {
    if (!animated() || animComplete()) return;

    const duration = animations.countUp.duration;
    const startTime = Date.now();
    const targetValues = props.items.map((item) => item.value);
    const frameInterval = 16;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      const newValues = targetValues.map((target) => Math.round(target * eased));
      setDisplayValues(newValues);

      if (progress >= 1) {
        clearInterval(intervalId);
        setAnimComplete(true);
      }
    }, frameInterval);

    onCleanup(() => clearInterval(intervalId));
  });

  return (
    <box flexDirection="row" gap={2}>
      <For each={props.items}>
        {(item, index) => {
          const fg = () => (item.color ? terminalColors[item.color] : terminalColors.text);

          return (
            <box
              flexDirection="column"
              alignItems="center"
              padding={2}
              borderStyle="single"
              borderColor={terminalColors.border}
            >
              <text fg={fg()}>
                <b>{String(displayValues()[index()])}</b>
              </text>
              <text fg={terminalColors.textMuted}>{item.label}</text>
            </box>
          );
        }}
      </For>
    </box>
  );
}

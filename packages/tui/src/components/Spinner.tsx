import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';

interface SpinnerProps {
  label?: string;
  color?: keyof typeof terminalColors;
}

export function Spinner(props: SpinnerProps) {
  const [frame, setFrame] = createSignal(0);

  createEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % symbols.spinner.length);
    }, 80);
    onCleanup(() => clearInterval(interval));
  });

  const color = () => props.color ?? 'accent';

  return (
    <box flexDirection="row" gap={1}>
      <text fg={terminalColors[color()]}>{symbols.spinner[frame()]}</text>
      <Show when={props.label}>
        <text fg={terminalColors.text}>{props.label}</text>
      </Show>
    </box>
  );
}

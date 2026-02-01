/**
 * DetailPane Component
 * Right-side detail panel with animated slide-in
 */

import { Show, For, createSignal, createEffect, onCleanup, type JSX } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export interface DetailField {
  label: string;
  value: string | string[];
  color?: string;
}

interface DetailPaneProps {
  title: string;
  subtitle?: string;
  icon?: string;
  fields?: DetailField[];
  content?: string;
  actions?: Array<{ key: string; label: string }>;
  width?: number;
  visible?: boolean;
  onClose?: () => void;
  children?: JSX.Element;
}

export function DetailPane(props: DetailPaneProps) {
  const [slideProgress, setSlideProgress] = createSignal(0);
  const width = () => props.width ?? 30;
  const visible = () => props.visible ?? true;

  createEffect(() => {
    if (visible()) {
      let frame = 0;
      let timeoutId: ReturnType<typeof setTimeout>;
      const animate = () => {
        frame++;
        const progress = Math.min(frame / 10, 1);
        setSlideProgress(progress);
        if (progress < 1) {
          timeoutId = setTimeout(animate, 16);
        }
      };
      timeoutId = setTimeout(animate, 16);
      onCleanup(() => clearTimeout(timeoutId));
    } else {
      setSlideProgress(0);
    }
  });

  const effectiveWidth = () => Math.round(width() * slideProgress());

  return (
    <Show when={visible() && slideProgress() > 0}>
      <box
        flexDirection="column"
        width={effectiveWidth()}
        borderStyle="round"
        borderColor={terminalColors.border}
        paddingX={1}
        paddingY={1}
      >
        <box flexDirection="row" marginBottom={1}>
          <Show when={props.icon}>
            <text fg={terminalColors.accent}>{props.icon} </text>
          </Show>
          <text fg={terminalColors.text}>
            <b>{props.title}</b>
          </text>
          <Show when={props.onClose}>
            <box onClick={() => props.onClose?.()}>
              <text fg={terminalColors.textMuted}> [x]</text>
            </box>
          </Show>
        </box>

        <Show when={props.subtitle}>
          <box marginBottom={1}>
            <text fg={terminalColors.textMuted}>{props.subtitle}</text>
          </box>
        </Show>

        <Show when={props.fields && props.fields.length > 0}>
          <box flexDirection="column" marginBottom={1}>
            <For each={props.fields}>
              {(field) => (
                <box flexDirection="column" marginBottom={1}>
                  <text fg={terminalColors.textMuted}>{field.label}</text>
                  <Show
                    when={Array.isArray(field.value)}
                    fallback={
                      <text fg={field.color || terminalColors.text}>
                        {field.value as string}
                      </text>
                    }
                  >
                    <For each={field.value as string[]}>
                      {(val) => (
                        <text fg={field.color || terminalColors.text}>• {val}</text>
                      )}
                    </For>
                  </Show>
                </box>
              )}
            </For>
          </box>
        </Show>

        <Show when={props.content}>
          <box flexDirection="column" marginBottom={1}>
            <text fg={terminalColors.text}>{props.content}</text>
          </box>
        </Show>

        <Show when={props.children}>
          <box flexDirection="column" marginBottom={1}>
            {props.children}
          </box>
        </Show>

        <Show when={props.actions && props.actions.length > 0}>
          <text fg={terminalColors.textMuted}>─────</text>
          <For each={props.actions}>
            {(action) => (
              <text fg={terminalColors.textMuted}>
                <text fg={terminalColors.accent}>{action.key}</text> {action.label}
              </text>
            )}
          </For>
        </Show>
      </box>
    </Show>
  );
}

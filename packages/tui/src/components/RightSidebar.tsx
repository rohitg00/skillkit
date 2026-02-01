import { Show, For, createSignal } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { symbols, AGENT_LOGOS } from '../theme/symbols.js';

interface RightSidebarProps {
  width: number;
  rows: number;
}

const TOP_AGENTS = ['claude-code', 'cursor', 'codex'] as const;

export function RightSidebar(props: RightSidebarProps) {
  const [sections, setSections] = createSignal({
    context: true,
    agents: true,
    tasks: false,
  });

  const toggleSection = (key: keyof ReturnType<typeof sections>) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <box
      flexDirection="column"
      width={props.width}
      borderLeft
      borderColor={terminalColors.border}
      paddingLeft={1}
    >
      <box flexDirection="column" marginBottom={1}>
        <text fg={terminalColors.text}>
          {sections().context ? '▼' : '▸'} Context
        </text>
        <Show when={sections().context}>
          <text fg={terminalColors.textSecondary}>  Skills: 127</text>
          <text fg={terminalColors.textSecondary}>  Agents: 32 (3{symbols.active})</text>
          <text fg={terminalColors.textSecondary}>  Workflows: 4</text>
        </Show>
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={terminalColors.text}>
          {sections().agents ? '▼' : '▸'} Agents (3)
        </text>
        <Show when={sections().agents}>
          <For each={[...TOP_AGENTS]}>
            {(agent) => {
              const logo = AGENT_LOGOS[agent];
              return (
                <text fg={terminalColors.text}>
                  {'  '}{logo.icon} {logo.name} {symbols.active}
                </text>
              );
            }}
          </For>
          <text fg={terminalColors.textMuted}>  +29 more</text>
        </Show>
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={terminalColors.text}>
          {sections().tasks ? '▼' : '▸'} Tasks (2)
        </text>
        <Show when={sections().tasks}>
          <text fg={terminalColors.textSecondary}>  {symbols.pending} Syncing...</text>
        </Show>
      </box>

      <box flexGrow={1} />
    </box>
  );
}

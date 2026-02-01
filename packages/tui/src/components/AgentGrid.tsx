import { Show, For, createMemo } from 'solid-js';
import { AGENT_LOGOS, type AgentLogo } from '../theme/symbols.js';
import { terminalColors } from '../theme/colors.js';

interface AgentGridProps {
  maxVisible?: number;
  showStatus?: boolean;
  detectedAgents?: string[];
  columns?: number;
}

export function AgentGrid(props: AgentGridProps) {
  const maxVisible = () => props.maxVisible ?? 12;
  const showStatus = () => props.showStatus ?? true;
  const detectedAgents = () => props.detectedAgents ?? [];
  const columns = () => Math.max(1, props.columns ?? 4);

  const allAgents = Object.entries(AGENT_LOGOS);
  const visibleAgents = () => allAgents.slice(0, maxVisible());
  const hiddenCount = () => allAgents.length - maxVisible();

  const rows = createMemo((): [string, AgentLogo][][] => {
    const result: [string, AgentLogo][][] = [];
    const visible = visibleAgents();
    for (let i = 0; i < visible.length; i += columns()) {
      result.push(visible.slice(i, i + columns()));
    }
    return result;
  });

  return (
    <box flexDirection="column">
      <text fg={terminalColors.text}>
        <b>Works with</b>
      </text>
      <text> </text>
      <For each={rows()}>
        {(row, rowIndex) => (
          <box flexDirection="row">
            <For each={row}>
              {([agentType, agent]) => {
                const isDetected = () => detectedAgents().includes(agentType);
                const statusIcon = () => (showStatus() ? (isDetected() ? '●' : '○') : '');
                const fg = () => (isDetected() ? terminalColors.accent : terminalColors.text);

                return (
                  <box width={18}>
                    <text fg={fg()}>
                      {agent.icon} {agent.name}
                      <Show when={showStatus()}>
                        <span fg={isDetected() ? terminalColors.success : terminalColors.textMuted}>
                          {' '}
                          {statusIcon()}
                        </span>
                      </Show>
                    </text>
                  </box>
                );
              }}
            </For>
          </box>
        )}
      </For>
      <Show when={hiddenCount() > 0}>
        <text fg={terminalColors.textMuted}>+{hiddenCount()} more agents</text>
      </Show>
    </box>
  );
}

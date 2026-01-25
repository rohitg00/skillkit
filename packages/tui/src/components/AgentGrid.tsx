/**
 * AgentGrid Component
 * Displays monochromatic agent logos in a grid layout
 */
import { AGENT_LOGOS, type AgentLogo } from '../theme/symbols.js';
import { terminalColors } from '../theme/colors.js';

interface AgentGridProps {
  /** Maximum number of agents to display */
  maxVisible?: number;
  /** Show status indicators for detected agents */
  showStatus?: boolean;
  /** Agent types that are detected/active */
  detectedAgents?: string[];
  /** Number of columns in the grid */
  columns?: number;
}

export function AgentGrid({
  maxVisible = 12,
  showStatus = true,
  detectedAgents = [],
  columns = 4,
}: AgentGridProps) {
  const allAgents = Object.entries(AGENT_LOGOS);
  const visibleAgents = allAgents.slice(0, maxVisible);
  const hiddenCount = allAgents.length - maxVisible;

  // Group agents into rows
  const rows: [string, AgentLogo][][] = [];
  for (let i = 0; i < visibleAgents.length; i += columns) {
    rows.push(visibleAgents.slice(i, i + columns));
  }

  return (
    <box flexDirection="column">
      <text fg={terminalColors.text}>
        <b>Works with</b>
      </text>
      <text> </text>
      {rows.map((row, rowIndex) => (
        <box key={`row-${rowIndex}`} flexDirection="row">
          {row.map(([agentType, agent]) => {
            const isDetected = detectedAgents.includes(agentType);
            const statusIcon = showStatus ? (isDetected ? '●' : '○') : '';
            const fg = isDetected ? terminalColors.accent : terminalColors.text;

            return (
              <box key={agentType} width={18}>
                <text fg={fg}>
                  {agent.icon} {agent.name}
                  {showStatus && (
                    <span fg={isDetected ? terminalColors.success : terminalColors.textMuted}>
                      {' '}{statusIcon}
                    </span>
                  )}
                </text>
              </box>
            );
          })}
        </box>
      ))}
      {hiddenCount > 0 && (
        <text fg={terminalColors.textMuted}>+{hiddenCount} more agents</text>
      )}
    </box>
  );
}

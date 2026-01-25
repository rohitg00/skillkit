import { useState, useEffect, useMemo } from 'react';
import { type Screen, loadSkills, TOTAL_AGENTS } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { symbols, AGENT_LOGOS } from '../theme/symbols.js';
import { getVersion } from '../utils/helpers.js';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const FEATURES = [
  { key: 'Sync', color: terminalColors.sync, desc: 'share across agents' },
  { key: 'Browse', color: terminalColors.browse, desc: 'discover skills' },
  { key: 'Recommend', color: terminalColors.recommend, desc: 'AI suggestions' },
  { key: 'Translate', color: terminalColors.translate, desc: 'convert formats' },
  { key: 'Workflow', color: terminalColors.workflow, desc: 'automate chains' },
  { key: 'Team', color: terminalColors.text, desc: 'collaborate' },
];

export function Home({ cols = 80 }: HomeProps) {
  const [animPhase, setAnimPhase] = useState(0);
  const [stats, setStats] = useState({ skills: 0, agents: TOTAL_AGENTS, synced: 0 });
  const [detectedAgents, setDetectedAgents] = useState<string[]>([]);

  const version = getVersion();
  const isCompact = cols < 70;
  const isNarrow = cols < 50;
  const contentWidth = Math.min(cols - 4, 55);
  const line = '─'.repeat(contentWidth);

  useEffect(() => {
    if (animPhase >= 5) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  useEffect(() => {
    const skillsData = loadSkills();
    setStats({
      skills: skillsData.skills.length,
      agents: TOTAL_AGENTS,
      synced: Math.min(skillsData.skills.length, 3),
    });
    setDetectedAgents(['claude-code', 'cursor', 'github-copilot']);
  }, []);

  const visibleAgents = useMemo(() => {
    const allAgents = Object.entries(AGENT_LOGOS);
    const perRow = isNarrow || isCompact ? 2 : 3;
    const maxAgents = isNarrow ? 4 : isCompact ? 6 : 9;
    return {
      agents: allAgents.slice(0, maxAgents),
      perRow,
      remaining: allAgents.length - maxAgents,
    };
  }, [isCompact, isNarrow]);

  const getAgentWidth = () => {
    if (isNarrow) return 22;
    if (isCompact) return 26;
    return 18;
  };

  return (
    <box flexDirection="column" padding={1}>
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row">
            <text fg={terminalColors.text}>{symbols.brandIcon} skillkit</text>
            <text fg={terminalColors.textMuted}>  v{version}</text>
          </box>
          <text fg={terminalColors.textMuted}>universal skills for ai coding agents</text>
          <text> </text>
        </box>
      )}

      {animPhase >= 2 && (
        <box flexDirection="column">
          <text fg={terminalColors.textMuted}>{line}</text>
          <text> </text>
          <box flexDirection="row">
            <box width={14}><text fg={terminalColors.accent}>{stats.skills}</text></box>
            <box width={14}><text fg={terminalColors.text}>{stats.agents}</text></box>
            <box width={14}><text fg={terminalColors.text}>{stats.synced}</text></box>
          </box>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted} width={14}>skills</text>
            <text fg={terminalColors.textMuted} width={14}>agents</text>
            <text fg={terminalColors.textMuted} width={14}>synced</text>
          </box>
          <text> </text>
          <text fg={terminalColors.textMuted}>{line}</text>
          <text> </text>
        </box>
      )}

      {animPhase >= 3 && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Works with</text>
          <text> </text>
          {Array(Math.ceil(visibleAgents.agents.length / visibleAgents.perRow))
            .fill(0)
            .map((_, rowIdx) => (
              <box key={rowIdx} flexDirection="row">
                {visibleAgents.agents
                  .slice(rowIdx * visibleAgents.perRow, (rowIdx + 1) * visibleAgents.perRow)
                  .map(([type, agent]) => {
                    const isDetected = detectedAgents.includes(type);
                    return (
                      <box key={type} width={getAgentWidth()} flexDirection="row">
                        <text fg={terminalColors.text}>{agent.icon} {agent.name} </text>
                        <text fg={isDetected ? terminalColors.accent : terminalColors.textMuted}>
                          {isDetected ? '●' : '○'}
                        </text>
                      </box>
                    );
                  })}
              </box>
            ))}
          {visibleAgents.remaining > 0 && (
            <text fg={terminalColors.textMuted}>+{visibleAgents.remaining} more</text>
          )}
          <text> </text>
          <text fg={terminalColors.textMuted}>{line}</text>
          <text> </text>
        </box>
      )}

      {animPhase >= 4 && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Features</text>
          <text> </text>
          {FEATURES.map((feat) => (
            <box key={feat.key} flexDirection="row">
              <text fg={feat.color} width={12}>  {feat.key}</text>
              <text fg={terminalColors.textMuted}>{feat.desc}</text>
            </box>
          ))}
          <text> </text>
        </box>
      )}

      {animPhase >= 5 && (
        <box flexDirection="column">
          <text fg={terminalColors.textMuted}>{line}</text>
          <text fg={terminalColors.textMuted}>
            {isCompact ? 'b browse  m market  / help  q quit' : 'b browse  m market  i installed  / help  q quit'}
          </text>
        </box>
      )}
    </box>
  );
}

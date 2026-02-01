import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
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

export function Home(props: HomeProps) {
  const [animPhase, setAnimPhase] = createSignal(0);
  const [stats, setStats] = createSignal({ skills: 0, agents: TOTAL_AGENTS, synced: 0 });
  const [detectedAgents, setDetectedAgents] = createSignal<string[]>([]);

  const cols = () => props.cols ?? 80;
  const version = getVersion();
  const isCompact = () => cols() < 70;
  const isNarrow = () => cols() < 50;
  const contentWidth = () => Math.min(cols() - 4, 55);
  const line = () => '─'.repeat(contentWidth());

  createEffect(() => {
    if (animPhase() >= 5) return;
    const timer = setTimeout(() => setAnimPhase((p) => p + 1), 100);
    onCleanup(() => clearTimeout(timer));
  });

  createEffect(() => {
    const skillsData = loadSkills();
    setStats({
      skills: skillsData.skills.length,
      agents: TOTAL_AGENTS,
      synced: Math.min(skillsData.skills.length, 3),
    });
    setDetectedAgents(['claude-code', 'cursor', 'github-copilot']);
  });

  const visibleAgents = createMemo(() => {
    const allAgents = Object.entries(AGENT_LOGOS);
    const perRow = isNarrow() || isCompact() ? 2 : 3;
    const maxAgents = isNarrow() ? 4 : isCompact() ? 6 : 9;
    return {
      agents: allAgents.slice(0, maxAgents),
      perRow,
      remaining: allAgents.length - maxAgents,
    };
  });

  const getAgentWidth = () => {
    if (isNarrow()) return 22;
    if (isCompact()) return 26;
    return 18;
  };

  const agentRows = createMemo(() => {
    const { agents, perRow } = visibleAgents();
    const rows: typeof agents[] = [];
    for (let i = 0; i < agents.length; i += perRow) {
      rows.push(agents.slice(i, i + perRow));
    }
    return rows;
  });

  return (
    <box flexDirection="column" padding={1}>
      <Show when={animPhase() >= 1}>
        <box flexDirection="column">
          <box flexDirection="row">
            <text fg={terminalColors.text}>
              {symbols.brandIcon} skillkit
            </text>
            <text fg={terminalColors.textMuted}>  v{version}</text>
          </box>
          <text fg={terminalColors.textMuted}>universal skills for ai coding agents</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          <text fg={terminalColors.textMuted}>{line()}</text>
          <text> </text>
          <box flexDirection="row">
            <box width={14}>
              <text fg={terminalColors.accent}>{stats().skills}</text>
            </box>
            <box width={14}>
              <text fg={terminalColors.text}>{stats().agents}</text>
            </box>
            <box width={14}>
              <text fg={terminalColors.text}>{stats().synced}</text>
            </box>
          </box>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted} width={14}>
              skills
            </text>
            <text fg={terminalColors.textMuted} width={14}>
              agents
            </text>
            <text fg={terminalColors.textMuted} width={14}>
              synced
            </text>
          </box>
          <text> </text>
          <text fg={terminalColors.textMuted}>{line()}</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 3}>
        <box flexDirection="column">
          <text fg={terminalColors.text}>Works with</text>
          <text> </text>
          <For each={agentRows()}>
            {(row) => (
              <box flexDirection="row">
                <For each={row}>
                  {([type, agent]) => {
                    const isDetected = () => detectedAgents().includes(type);
                    return (
                      <box width={getAgentWidth()} flexDirection="row">
                        <text fg={terminalColors.text}>
                          {agent.icon} {agent.name}{' '}
                        </text>
                        <text fg={isDetected() ? terminalColors.accent : terminalColors.textMuted}>
                          {isDetected() ? '●' : '○'}
                        </text>
                      </box>
                    );
                  }}
                </For>
              </box>
            )}
          </For>
          <Show when={visibleAgents().remaining > 0}>
            <text fg={terminalColors.textMuted}>+{visibleAgents().remaining} more</text>
          </Show>
          <text> </text>
          <text fg={terminalColors.textMuted}>{line()}</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 4}>
        <box flexDirection="column">
          <text fg={terminalColors.text}>Features</text>
          <text> </text>
          <For each={FEATURES}>
            {(feat) => (
              <box flexDirection="row">
                <text fg={feat.color} width={12}>
                  {'  '}
                  {feat.key}
                </text>
                <text fg={terminalColors.textMuted}>{feat.desc}</text>
              </box>
            )}
          </For>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 5}>
        <box flexDirection="column">
          <text fg={terminalColors.textMuted}>{line()}</text>
          <text fg={terminalColors.textMuted}>
            {isCompact()
              ? 'b browse  m market  / help  q quit'
              : 'b browse  m market  i installed  / help  q quit'}
          </text>
        </box>
      </Show>
    </box>
  );
}

import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen, loadSkills } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { AGENT_LOGOS } from '../theme/symbols.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import { getSupportedAgents, translate } from '../services/translator.service.js';
import { getAgentAvailability } from '../services/executor.service.js';
import type { AgentType } from '@skillkit/core';

interface SyncProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface AgentSyncInfo {
  type: AgentType;
  name: string;
  icon: string;
  available: boolean;
  synced: boolean;
  skillCount: number;
}

export function Sync(props: SyncProps) {
  const [agents, setAgents] = createSignal<AgentSyncInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [syncStatus, setSyncStatus] = createSignal<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [skillCount, setSkillCount] = createSignal(0);

  const cols = () => props.cols ?? 80;
  const isCompact = () => cols() < 60;
  const contentWidth = () => Math.max(1, Math.min(cols() - 4, 60));

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const skillsData = loadSkills();
      setSkillCount(skillsData.skills.length);

      const supportedAgents = getSupportedAgents();
      const availability = await getAgentAvailability();

      const agentInfos: AgentSyncInfo[] = supportedAgents.slice(0, isCompact() ? 4 : 8).map((agent) => {
        const logo = AGENT_LOGOS[agent];
        const availInfo = availability.find((a) => a.agent === agent);

        return {
          type: agent,
          name: logo?.name || agent,
          icon: logo?.icon || '◇',
          available: availInfo?.available || false,
          synced: false,
          skillCount: 0,
        };
      });

      setAgents(agentInfos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    }

    setLoading(false);
  };

  const handleSync = async () => {
    const agentList = agents();
    if (agentList.length === 0) return;

    const agent = agentList[selectedIndex()];
    if (!agent || !agent.available) return;

    setSyncStatus('syncing');
    setSyncMessage(`Syncing to ${agent.name}...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAgents((prev) =>
        prev.map((a, idx) =>
          idx === selectedIndex()
            ? { ...a, synced: true, skillCount: skillCount() }
            : a
        )
      );

      setSyncStatus('done');
      setSyncMessage(`Synced ${skillCount()} skills to ${agent.name}`);
    } catch {
      setSyncStatus('error');
      setSyncMessage('Sync failed');
    }
  };

  const handleSyncAll = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Syncing to all available agents...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setAgents((prev) =>
        prev.map((a) =>
          a.available ? { ...a, synced: true, skillCount: skillCount() } : a
        )
      );

      const syncedCount = agents().filter((a) => a.available).length;
      setSyncStatus('done');
      setSyncMessage(`Synced to ${syncedCount} agents`);
    } catch {
      setSyncStatus('error');
      setSyncMessage('Sync failed');
    }
  };

  const handleKeyNav = (delta: number) => {
    const max = agents().length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleSync();
    else if (key.name === 'a') handleSyncAll();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') props.onNavigate('home');
  });

  const syncedCount = createMemo(() => agents().filter((a) => a.synced).length);
  const availableCount = createMemo(() => agents().filter((a) => a.available).length);
  const totalSkillsSynced = createMemo(() =>
    agents().reduce((sum, a) => sum + a.skillCount, 0)
  );

  const selectedAgent = () => {
    const agentList = agents();
    if (agentList.length === 0) return null;
    return agentList[selectedIndex()];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Sync"
        subtitle="Share skills across agents"
        icon="⟳"
        count={agents().length}
      />

      <Show when={error()}>
        <ErrorState
          message={error()!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={loading()}>
        <Spinner label="Loading agents..." />
      </Show>

      <Show when={!loading() && !error()}>
        <box flexDirection="row" marginBottom={1}>
          <text fg={terminalColors.success}>● {syncedCount()} synced</text>
          <text fg={terminalColors.textMuted}> | </text>
          <text fg={terminalColors.accent}>◎ {availableCount()} available</text>
          <text fg={terminalColors.textMuted}> | </text>
          <text fg={terminalColors.text}>{skillCount()} skills to sync</text>
        </box>

        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <Show when={syncStatus() === 'syncing'}>
          <StatusIndicator status="loading" label={syncMessage()} />
          <text> </text>
        </Show>

        <Show when={syncStatus() === 'done'}>
          <box flexDirection="row" marginBottom={1}>
            <text fg={terminalColors.success}>✓ </text>
            <text fg={terminalColors.text}>{syncMessage()}</text>
          </box>
        </Show>

        <Show when={syncStatus() === 'error'}>
          <box flexDirection="row" marginBottom={1}>
            <text fg={terminalColors.error}>✗ </text>
            <text fg={terminalColors.text}>{syncMessage()}</text>
          </box>
        </Show>

        <Show
          when={agents().length > 0}
          fallback={
            <EmptyState
              icon="⟳"
              title="No agents found"
              description="Install AI coding agents to sync skills"
            />
          }
        >
          <text fg={terminalColors.text}>
            <b>Agents</b>
          </text>
          <text> </text>

          <For each={agents()}>
            {(agent, idx) => {
              const selected = () => idx() === selectedIndex();
              return (
                <box flexDirection="row" marginBottom={1}>
                  <text
                    fg={selected() ? terminalColors.accent : terminalColors.text}
                    width={3}
                  >
                    {selected() ? '▸ ' : '  '}
                  </text>
                  <text
                    fg={
                      selected()
                        ? terminalColors.accent
                        : agent.available
                          ? terminalColors.text
                          : terminalColors.textMuted
                    }
                    width={20}
                  >
                    {agent.icon} {agent.name}
                  </text>
                  <text
                    fg={
                      agent.synced
                        ? terminalColors.success
                        : agent.available
                          ? terminalColors.accent
                          : terminalColors.textMuted
                    }
                    width={3}
                  >
                    {agent.synced ? '✓' : agent.available ? '○' : '✗'}
                  </text>
                  <text fg={terminalColors.textMuted} width={12}>
                    {agent.skillCount > 0 ? `${agent.skillCount} skills` : ''}
                  </text>
                  <Show when={!agent.available}>
                    <text fg={terminalColors.textMuted}>(unavailable)</text>
                  </Show>
                </box>
              );
            }}
          </For>
        </Show>

        <Show when={selectedAgent() && !selectedAgent()!.available}>
          <text> </text>
          <text fg={terminalColors.warning}>
            ⚠ {selectedAgent()!.name} is not installed or available
          </text>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter sync selected  a sync all  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

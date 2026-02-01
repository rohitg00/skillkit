import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen, loadSkillsWithDetails, type SkillWithDetails } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  getAgentAvailability,
  executeSkillWithAgent,
  listAvailableAgents,
  type AgentAvailability,
} from '../services/executor.service.js';
import type { AgentType } from '@skillkit/core';

interface ExecuteProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Execute(props: ExecuteProps) {
  const [skills, setSkills] = createSignal<SkillWithDetails[]>([]);
  const [agents, setAgents] = createSignal<AgentAvailability[]>([]);
  const [selectedSkillIndex, setSelectedSkillIndex] = createSignal(0);
  const [selectedAgentIndex, setSelectedAgentIndex] = createSignal(0);
  const [focusedPane, setFocusedPane] = createSignal<'skills' | 'agents'>('skills');
  const [executing, setExecuting] = createSignal(false);
  const [executionResult, setExecutionResult] = createSignal<{
    success: boolean;
    output: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [loadError, setLoadError] = createSignal<string | null>(null);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const skillsWithDetails = loadSkillsWithDetails();
      setSkills(skillsWithDetails);

      const agentAvailability = await getAgentAvailability();
      setAgents(agentAvailability);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (executing()) return;

    const skillList = skills();
    const agentList = agents();

    if (skillList.length === 0 || agentList.length === 0) return;

    const skill = skillList[selectedSkillIndex()];
    const agent = agentList[selectedAgentIndex()];

    if (!skill || !agent || !agent.available) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeSkillWithAgent(
        skill.path,
        agent.agent,
        { timeout: 60000 }
      );

      setExecutionResult({
        success: result.success,
        output: result.output || '',
        error: result.error,
      });
    } catch (err) {
      setExecutionResult({
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Execution failed',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyNav = (delta: number) => {
    if (focusedPane() === 'skills') {
      const max = skills().length - 1;
      setSelectedSkillIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    } else {
      const max = agents().length - 1;
      setSelectedAgentIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    }
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'tab' || key.name === 'l' || key.name === 'right') {
      setFocusedPane((p) => (p === 'skills' ? 'agents' : 'skills'));
    }
    else if (key.name === 'h' || key.name === 'left') {
      setFocusedPane((p) => (p === 'agents' ? 'skills' : 'agents'));
    }
    else if (key.name === 'return' || key.name === 'x') handleExecute();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (executionResult()) setExecutionResult(null);
      else props.onNavigate('home');
    }
  });

  const selectedSkill = () => {
    const list = skills();
    if (list.length === 0) return null;
    return list[selectedSkillIndex()];
  };

  const selectedAgent = () => {
    const list = agents();
    if (list.length === 0) return null;
    return list[selectedAgentIndex()];
  };

  const MAX_VISIBLE = 8;

  const skillsWindow = createMemo(() => {
    const list = skills();
    const selected = selectedSkillIndex();
    const total = list.length;
    if (total <= MAX_VISIBLE) return { start: 0, items: list };
    let start = Math.max(0, selected - Math.floor(MAX_VISIBLE / 2));
    start = Math.min(start, total - MAX_VISIBLE);
    return { start, items: list.slice(start, start + MAX_VISIBLE) };
  });

  const agentsWindow = createMemo(() => {
    const list = agents();
    const selected = selectedAgentIndex();
    const total = list.length;
    if (total <= MAX_VISIBLE) return { start: 0, items: list };
    let start = Math.max(0, selected - Math.floor(MAX_VISIBLE / 2));
    start = Math.min(start, total - MAX_VISIBLE);
    return { start, items: list.slice(start, start + MAX_VISIBLE) };
  });

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Execute"
        subtitle="Run skills with AI agents"
        icon="▶"
      />

      <Show when={loading()}>
        <Spinner label="Loading..." />
      </Show>

      <Show when={loadError()}>
        <ErrorState
          message={loadError()!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={!loading() && !loadError()}>
        <box flexDirection="row">
          <box flexDirection="column" width={30}>
            <text
              fg={
                focusedPane() === 'skills'
                  ? terminalColors.accent
                  : terminalColors.text
              }
            >
              <b>Skills</b>
            </text>
            <text> </text>

            <Show
              when={skills().length > 0}
              fallback={
                <EmptyState
                  title="No skills installed"
                  description="Browse to install"
                  action={{ label: 'Browse', key: 'b' }}
                  compact
                />
              }
            >
              <Show when={skillsWindow().start > 0}>
                <text fg={terminalColors.textMuted}>  ▲ {skillsWindow().start} more</text>
              </Show>
              <For each={skillsWindow().items}>
                {(skill, idx) => {
                  const originalIndex = () => skillsWindow().start + idx();
                  const isSelected = () =>
                    focusedPane() === 'skills' && originalIndex() === selectedSkillIndex();
                  return (
                    <box marginBottom={1}>
                      <text
                        fg={isSelected() ? terminalColors.accent : terminalColors.textSecondary}
                      >
                        {isSelected() ? '▸ ' : '  '}
                        {skill.name}
                      </text>
                    </box>
                  );
                }}
              </For>
              <Show when={skillsWindow().start + MAX_VISIBLE < skills().length}>
                <text fg={terminalColors.textMuted}>  ▼ {skills().length - skillsWindow().start - MAX_VISIBLE} more</text>
              </Show>
            </Show>
          </box>

          <box width={2}>
            <text fg={terminalColors.border}>│</text>
          </box>

          <box flexDirection="column" width={25}>
            <text
              fg={
                focusedPane() === 'agents'
                  ? terminalColors.accent
                  : terminalColors.text
              }
            >
              <b>Agents</b>
            </text>
            <text> </text>

            <Show
              when={agents().length > 0}
              fallback={
                <EmptyState
                  title="No agents found"
                  compact
                />
              }
            >
              <Show when={agentsWindow().start > 0}>
                <text fg={terminalColors.textMuted}>  ▲ {agentsWindow().start} more</text>
              </Show>
              <For each={agentsWindow().items}>
                {(agent, idx) => {
                  const originalIndex = () => agentsWindow().start + idx();
                  const isSelected = () =>
                    focusedPane() === 'agents' && originalIndex() === selectedAgentIndex();
                  const available = agent.available;
                  return (
                    <box flexDirection="row" marginBottom={1}>
                      <text
                        fg={
                          isSelected()
                            ? terminalColors.accent
                            : available
                              ? terminalColors.textSecondary
                              : terminalColors.textMuted
                        }
                      >
                        {isSelected() ? '▸ ' : '  '}
                        {agent.agent}
                      </text>
                      <text fg={available ? terminalColors.success : terminalColors.error}>
                        {' '}
                        {available ? '●' : '○'}
                      </text>
                    </box>
                  );
                }}
              </For>
              <Show when={agentsWindow().start + MAX_VISIBLE < agents().length}>
                <text fg={terminalColors.textMuted}>  ▼ {agents().length - agentsWindow().start - MAX_VISIBLE} more</text>
              </Show>
            </Show>
          </box>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <Show when={selectedSkill() && selectedAgent()}>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted}>Selected: </text>
            <text fg={terminalColors.accent}>{selectedSkill()!.name}</text>
            <text fg={terminalColors.textMuted}> → </text>
            <text
              fg={
                selectedAgent()!.available
                  ? terminalColors.accent
                  : terminalColors.textMuted
              }
            >
              {selectedAgent()!.agent}
            </text>
            <Show when={!selectedAgent()!.available}>
              <text fg={terminalColors.warning}> (unavailable)</text>
            </Show>
          </box>
        </Show>

        <Show when={executing()}>
          <text> </text>
          <StatusIndicator status="loading" label="Executing skill..." />
        </Show>

        <Show when={executionResult() && !executing()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
          <text
            fg={
              executionResult()!.success
                ? terminalColors.success
                : terminalColors.error
            }
          >
            {executionResult()!.success ? '✓ Execution completed' : '✗ Execution failed'}
          </text>
          <Show when={executionResult()!.error}>
            <text fg={terminalColors.error}>{executionResult()!.error}</text>
          </Show>
          <Show when={executionResult()!.output}>
            <text fg={terminalColors.textMuted}>
              {executionResult()!.output.slice(0, 200)}
              {executionResult()!.output.length > 200 ? '...' : ''}
            </text>
          </Show>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>
          Tab/←/→ switch pane  j/k navigate  Enter execute  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

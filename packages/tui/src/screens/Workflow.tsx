import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { DetailPane } from '../components/DetailPane.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  loadWorkflowsList,
  loadWorkflow,
  executeWorkflow,
  type WorkflowServiceState,
  type WorkflowListItem,
} from '../services/workflow.service.js';

interface WorkflowProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Workflow(props: WorkflowProps) {
  const [state, setState] = createSignal<WorkflowServiceState>({
    workflows: [],
    current: null,
    progress: null,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);
  const [executing, setExecuting] = createSignal(false);

  const cols = () => props.cols ?? 80;
  const isCompact = () => cols() < 60;
  const contentWidth = () => Math.max(1, Math.min(cols() - 4, 60));

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await loadWorkflowsList();
    setState(result);
  };

  const handleExecute = async () => {
    const workflows = state().workflows;
    if (workflows.length === 0) return;

    const workflow = workflows[selectedIndex()];
    if (!workflow) return;

    setExecuting(true);
    const result = await executeWorkflow(workflow.name, undefined, (progress) => {
      setState((s) => ({ ...s, progress }));
    });
    setExecuting(false);

    if (result) {
      loadData();
    }
  };

  const handleKeyNav = (delta: number) => {
    const max = state().workflows.length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') setShowDetail(true);
    else if (key.name === 'r') loadData();
    else if (key.name === 'x') handleExecute();
    else if (key.name === 'escape') {
      if (showDetail()) setShowDetail(false);
      else props.onNavigate('home');
    }
  });

  const successCount = createMemo(
    () => state().workflows.filter((w) => w.status === 'completed').length
  );
  const failedCount = createMemo(
    () => state().workflows.filter((w) => w.status === 'failed').length
  );
  const runningCount = createMemo(
    () => state().workflows.filter((w) => w.status === 'running').length
  );

  const selectedWorkflow = () => {
    const workflows = state().workflows;
    if (workflows.length === 0) return null;
    return workflows[selectedIndex()];
  };

  const getStatusIcon = (status: WorkflowListItem['status']): string => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '⟳';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: WorkflowListItem['status']): string => {
    switch (status) {
      case 'completed':
        return terminalColors.success;
      case 'failed':
        return terminalColors.error;
      case 'running':
        return terminalColors.accent;
      default:
        return terminalColors.textMuted;
    }
  };

  const divider = () => '─'.repeat(contentWidth());

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Workflows"
        subtitle="Automate skill chains"
        icon="~"
        count={state().workflows.length}
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading}>
        <Spinner label="Loading workflows..." />
      </Show>

      <Show when={!state().loading && !state().error}>
        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <box flexDirection="row" marginBottom={1}>
              <Show when={successCount() > 0}>
                <text fg={terminalColors.success}>✓ {successCount()} passed</text>
                <text fg={terminalColors.textMuted}> | </text>
              </Show>
              <Show when={failedCount() > 0}>
                <text fg={terminalColors.error}>✗ {failedCount()} failed</text>
                <text fg={terminalColors.textMuted}> | </text>
              </Show>
              <Show when={runningCount() > 0}>
                <text fg={terminalColors.accent}>⟳ {runningCount()} running</text>
              </Show>
              <Show when={successCount() === 0 && failedCount() === 0 && runningCount() === 0}>
                <text fg={terminalColors.textMuted}>No workflows run yet</text>
              </Show>
            </box>

            <text fg={terminalColors.textMuted}>{divider()}</text>
            <text> </text>

            <Show
              when={state().workflows.length > 0}
              fallback={
                <EmptyState
                  icon="~"
                  title="No workflows found"
                  description="Create workflows in .skillkit/workflows/"
                />
              }
            >
              <text fg={terminalColors.text}>
                <b>Available Workflows</b>
              </text>
              <text> </text>

              <For each={state().workflows}>
                {(wf, idx) => {
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
                        fg={selected() ? terminalColors.accent : terminalColors.text}
                        width={20}
                      >
                        {wf.name}
                      </text>
                      <text fg={getStatusColor(wf.status)} width={3}>
                        {getStatusIcon(wf.status)}{' '}
                      </text>
                      <text fg={terminalColors.textMuted} width={8}>
                        {wf.skills}s / {wf.waves}w
                      </text>
                      <Show when={wf.lastRun}>
                        <text fg={terminalColors.textMuted}> • {wf.lastRun}</text>
                      </Show>
                    </box>
                  );
                }}
              </For>
            </Show>

            <Show when={executing()}>
              <text> </text>
              <StatusIndicator status="loading" label="Executing workflow..." />
              <Show when={state().progress}>
                <text fg={terminalColors.textMuted}>
                  Wave {state().progress?.currentWave}/{state().progress?.totalWaves} •{' '}
                  Skill {state().progress?.currentSkill}/{state().progress?.totalSkills}
                </text>
              </Show>
            </Show>
          </box>

          <Show when={showDetail() && selectedWorkflow()}>
            <DetailPane
              title={selectedWorkflow()!.name}
              subtitle={selectedWorkflow()!.description}
              icon="~"
              fields={[
                { label: 'Skills', value: String(selectedWorkflow()!.skills) },
                { label: 'Waves', value: String(selectedWorkflow()!.waves) },
                { label: 'Status', value: selectedWorkflow()!.status },
                {
                  label: 'Last Run',
                  value: selectedWorkflow()!.lastRun || 'Never',
                },
              ]}
              actions={[
                { key: 'x', label: 'Execute' },
                { key: 'e', label: 'Edit' },
                { key: 'Esc', label: 'Close' },
              ]}
              width={28}
              visible={showDetail()}
              onClose={() => setShowDetail(false)}
            />
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>{divider()}</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter details  x execute  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

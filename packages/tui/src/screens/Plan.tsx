import { createSignal, createEffect, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  loadPlansList,
  loadPlan,
  validatePlan,
  executePlan,
  executePlanDryRun,
  type PlanServiceState,
  type PlanListItem,
} from '../services/plan.service.js';

interface PlanProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Plan(props: PlanProps) {
  const [state, setState] = createSignal<PlanServiceState>({
    plans: [],
    current: null,
    validation: null,
    execution: null,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [executionProgress, setExecutionProgress] = createSignal(0);
  const [executing, setExecuting] = createSignal(false);
  const [validating, setValidating] = createSignal(false);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await loadPlansList();
    setState(result);
  };

  const handleValidate = async () => {
    const plans = state().plans;
    if (plans.length === 0) return;

    const planItem = plans[selectedIndex()];
    if (!planItem) return;

    setValidating(true);
    const plan = await loadPlan(planItem.path);
    if (plan) {
      const validation = await validatePlan(plan);
      setState((s) => ({ ...s, current: plan, validation }));
    }
    setValidating(false);
  };

  const handleExecute = async (dryRun: boolean = false) => {
    const plans = state().plans;
    if (plans.length === 0) return;

    const planItem = plans[selectedIndex()];
    if (!planItem) return;

    setExecuting(true);
    setExecutionProgress(0);

    const plan = await loadPlan(planItem.path);
    if (!plan) {
      setExecuting(false);
      return;
    }

    const executeFn = dryRun ? executePlanDryRun : executePlan;
    let completedCount = 0;
    const totalTasks = plan.tasks.length;
    const result = await executeFn(plan, undefined, (event) => {
      if (event === 'plan:task_completed') {
        completedCount++;
        setExecutionProgress((completedCount / totalTasks) * 100);
      }
    });

    setState((s) => ({ ...s, execution: result }));
    setExecuting(false);
    loadData();
  };

  const handleKeyNav = (delta: number) => {
    const max = state().plans.length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'v') handleValidate();
    else if (key.name === 'x') handleExecute(false);
    else if (key.name === 'd') handleExecute(true);
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') props.onNavigate('home');
  });

  const getStatusIcon = (status: PlanListItem['status']): string => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'in_progress':
        return '⟳';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: PlanListItem['status']): string => {
    switch (status) {
      case 'completed':
        return terminalColors.success;
      case 'failed':
        return terminalColors.error;
      case 'in_progress':
        return terminalColors.accent;
      default:
        return terminalColors.textMuted;
    }
  };

  const selectedPlan = () => {
    const plans = state().plans;
    if (plans.length === 0) return null;
    return plans[selectedIndex()];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Plan Execution"
        subtitle="Structured multi-step execution"
        icon="▣"
        count={state().plans.length}
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading}>
        <Spinner label="Loading plans..." />
      </Show>

      <Show when={!state().loading && !state().error}>
        <Show
          when={state().plans.length > 0}
          fallback={
            <EmptyState
              icon="▣"
              title="No plans found"
              description="Create plans in .skillkit/plans/"
            />
          }
        >
          <text fg={terminalColors.text}>
            <b>Available Plans</b>
          </text>
          <text> </text>

          <For each={state().plans}>
            {(plan, idx) => {
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
                    width={25}
                  >
                    {plan.name}
                  </text>
                  <text fg={getStatusColor(plan.status)} width={3}>
                    {getStatusIcon(plan.status)}{' '}
                  </text>
                  <text fg={terminalColors.textMuted} width={10}>
                    {plan.tasks} tasks
                  </text>
                  <Show when={plan.lastModified}>
                    <text fg={terminalColors.textMuted}> • {plan.lastModified}</text>
                  </Show>
                </box>
              );
            }}
          </For>
        </Show>

        <Show when={validating()}>
          <text> </text>
          <StatusIndicator status="loading" label="Validating plan..." />
        </Show>

        <Show when={state().validation && !validating()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────</text>
          <text fg={terminalColors.text}>
            <b>Validation Result</b>
          </text>
          <text
            fg={state().validation!.valid ? terminalColors.success : terminalColors.error}
          >
            {state().validation!.valid ? '✓ Valid' : '✗ Invalid'}
          </text>
          <Show when={state().validation!.issues && state().validation!.issues.length > 0}>
            <For each={state().validation!.issues.slice(0, 3)}>
              {(issue) => (
                <text fg={terminalColors.warning}>• {issue.message}</text>
              )}
            </For>
          </Show>
        </Show>

        <Show when={executing()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────</text>
          <StatusIndicator status="loading" label="Executing plan..." />
          <box flexDirection="row" marginTop={1}>
            <text fg={terminalColors.text}>Progress: </text>
            <ProgressBar progress={executionProgress()} width={30} />
          </box>
        </Show>

        <Show when={state().execution && !executing()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────</text>
          <text fg={terminalColors.text}>
            <b>Execution Result</b>
          </text>
          <text
            fg={state().execution!.success ? terminalColors.success : terminalColors.error}
          >
            {state().execution!.success ? '✓ Completed' : '✗ Failed'}
          </text>
          <text fg={terminalColors.textMuted}>
            Completed: {state().execution!.completedTasks.length} | Failed: {state().execution!.failedTasks.length}
          </text>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  v validate  x execute  d dry-run  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

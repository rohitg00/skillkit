import { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import {
  PlanParser,
  PlanValidator,
  PlanExecutor,
  type StructuredPlan,
  type PlanTask,
} from '@skillkit/core';
import * as fs from 'fs';
import * as path from 'path';

interface Props {
  cols?: number;
  rows?: number;
}

type View = 'plans' | 'tasks' | 'steps';

interface PlanFile {
  name: string;
  path: string;
  plan?: StructuredPlan;
  valid?: boolean;
  error?: string;
}

export function Plan({ rows = 24 }: Props) {
  const [planFiles, setPlanFiles] = useState<PlanFile[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanFile | null>(null);
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('plans');
  const [sel, setSel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const parser = useMemo(() => new PlanParser(), []);
  const validator = useMemo(() => new PlanValidator(), []);

  const maxVisible = Math.max(5, rows - 10);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const cwd = process.cwd();
      const files: PlanFile[] = [];

      // Look for plan files in common locations
      const searchPaths = [
        cwd,
        path.join(cwd, 'plans'),
        path.join(cwd, '.skillkit', 'plans'),
      ];

      for (const searchPath of searchPaths) {
        if (fs.existsSync(searchPath)) {
          const entries = fs.readdirSync(searchPath, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isFile() && (entry.name.endsWith('.plan.md') || entry.name.endsWith('-plan.md'))) {
              const filePath = path.join(searchPath, entry.name);
              const content = fs.readFileSync(filePath, 'utf-8');
              try {
                const plan = parser.parse(content);
                const validation = validator.validate(plan);
                const errorIssue = validation.issues.find(i => i.type === 'error');
                files.push({
                  name: entry.name,
                  path: filePath,
                  plan,
                  valid: validation.valid,
                  error: errorIssue?.message,
                });
              } catch {
                files.push({
                  name: entry.name,
                  path: filePath,
                  valid: false,
                  error: 'Failed to parse plan',
                });
              }
            }
          }
        }
      }

      setPlanFiles(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load plans');
    }
    setLoading(false);
  };

  const selectPlan = (planFile: PlanFile) => {
    if (planFile.plan) {
      setSelectedPlan(planFile);
      setView('tasks');
      setSel(0);
    }
  };

  const selectTask = (task: PlanTask) => {
    setSelectedTask(task);
    setView('steps');
    setSel(0);
  };

  const executePlan = async (planFile: PlanFile) => {
    if (!planFile.plan) return;

    setExecuting(true);
    setMessage(null);
    try {
      const executor = new PlanExecutor();
      await executor.execute(planFile.plan, { dryRun: true });
      setMessage(`Executed plan: ${planFile.plan.name} (dry run)`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to execute plan');
    }
    setExecuting(false);
  };

  const getItems = () => {
    if (view === 'plans') return planFiles;
    if (view === 'tasks' && selectedPlan?.plan) return selectedPlan.plan.tasks;
    if (view === 'steps' && selectedTask) return selectedTask.steps;
    return [];
  };

  const items = getItems();
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), items.length - maxVisible));
  const visible = items.slice(start, start + maxVisible);

  useInput((input, key) => {
    if (loading || executing) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(items.length - 1, i + 1));
    else if (input === 'r') loadPlans();
    else if (key.escape || input === 'b') {
      if (view === 'steps') {
        setView('tasks');
        setSelectedTask(null);
        setSel(0);
      } else if (view === 'tasks') {
        setView('plans');
        setSelectedPlan(null);
        setSel(0);
      }
    }
    else if (key.return) {
      if (view === 'plans' && planFiles[sel]) {
        selectPlan(planFiles[sel]);
      } else if (view === 'tasks' && selectedPlan?.plan?.tasks[sel]) {
        selectTask(selectedPlan.plan.tasks[sel]);
      }
    }
    else if (input === 'x' && view === 'plans' && planFiles[sel]?.plan) {
      executePlan(planFiles[sel]);
    }
  });

  const renderPlanItem = (planFile: PlanFile, idx: number) => {
    const isSel = idx === sel;
    const statusIcon = planFile.valid ? symbols.success : symbols.error;
    const statusColor = planFile.valid ? 'green' : 'red';

    return (
      <Box key={planFile.path} flexDirection="column">
        <Text inverse={isSel}>
          {isSel ? symbols.pointer : ' '} <Text color={statusColor}>{statusIcon}</Text> {planFile.name}
        </Text>
        {isSel && planFile.plan && (
          <>
            <Text dimColor>   {planFile.plan.goal}</Text>
            <Text dimColor>   {planFile.plan.tasks.length} task(s) | {planFile.plan.techStack?.join(', ') || 'No stack'}</Text>
          </>
        )}
        {isSel && planFile.error && (
          <Text color="red">   {planFile.error}</Text>
        )}
      </Box>
    );
  };

  const renderTaskItem = (task: PlanTask, idx: number) => {
    const isSel = idx === sel;
    return (
      <Box key={task.id} flexDirection="column">
        <Text inverse={isSel}>
          {isSel ? symbols.pointer : ' '} [{task.id}] {task.name}
        </Text>
        {isSel && (
          <>
            <Text dimColor>   {task.steps.length} step(s)</Text>
            {task.files?.create && <Text dimColor>   Create: {task.files.create.join(', ')}</Text>}
            {task.files?.modify && <Text dimColor>   Modify: {task.files.modify.join(', ')}</Text>}
            {task.files?.test && <Text dimColor>   Test: {task.files.test.join(', ')}</Text>}
          </>
        )}
      </Box>
    );
  };

  const renderStepItem = (step: { number: number; description: string; type: string }, idx: number) => {
    const isSel = idx === sel;
    const typeColors: Record<string, string> = {
      test: 'yellow',
      verify: 'cyan',
      implement: 'green',
      commit: 'magenta',
    };

    return (
      <Box key={step.number} flexDirection="column">
        <Text inverse={isSel}>
          {isSel ? symbols.pointer : ' '} <Text color={typeColors[step.type] || 'white'}>[{step.type}]</Text> Step {step.number}
        </Text>
        {isSel && (
          <Text dimColor>   {step.description}</Text>
        )}
      </Box>
    );
  };

  const getTitle = () => {
    if (view === 'plans') return 'PLANS';
    if (view === 'tasks') return `TASKS: ${selectedPlan?.plan?.name || ''}`;
    if (view === 'steps') return `STEPS: Task ${selectedTask?.id}`;
    return 'PLANS';
  };

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>{getTitle()}</Text>
      <Text dimColor>
        {view === 'plans' && `${planFiles.length} plan(s) found`}
        {view === 'tasks' && selectedPlan?.plan && `${selectedPlan.plan.tasks.length} task(s)`}
        {view === 'steps' && selectedTask && `${selectedTask.steps.length} step(s)`}
      </Text>

      {loading && <Text color="yellow">Loading plans...</Text>}
      {executing && <Text color="yellow">Executing plan...</Text>}
      {error && <Text color="red">{symbols.error} {error}</Text>}
      {message && <Text color="green">{symbols.success} {message}</Text>}

      {!loading && !executing && items.length === 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>No {view} found.</Text>
          {view === 'plans' && (
            <Text dimColor>Create a plan file: *.plan.md or *-plan.md</Text>
          )}
        </Box>
      )}

      {!loading && !executing && items.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {view === 'plans' && (visible as PlanFile[]).map((pf, i) => renderPlanItem(pf, start + i))}
          {view === 'tasks' && (visible as PlanTask[]).map((t, i) => renderTaskItem(t, start + i))}
          {view === 'steps' && (visible as Array<{ number: number; description: string; type: string }>).map((s, i) => renderStepItem(s, start + i))}
          {start + maxVisible < items.length && (
            <Text dimColor>  ↓ {items.length - start - maxVisible} more</Text>
          )}
        </Box>
      )}

      <Box marginTop={1}>
        {view === 'plans' && (
          <Text dimColor>Enter=view tasks  x=execute (dry-run)  r=refresh  q=quit</Text>
        )}
        {view === 'tasks' && (
          <Text dimColor>Enter=view steps  b/Esc=back  q=quit</Text>
        )}
        {view === 'steps' && (
          <Text dimColor>b/Esc=back  q=quit</Text>
        )}
      </Box>
    </Box>
  );
}

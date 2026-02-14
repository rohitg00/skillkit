import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState } from '../components/EmptyState.js';
import { execFile } from 'node:child_process';

interface TimelineProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface TimelineEvent {
  timestamp: string;
  type: string;
  source: string;
  summary: string;
  details?: Record<string, unknown>;
}

interface TimelineResult {
  projectPath: string;
  sessionDate: string;
  events: TimelineEvent[];
  totalCount: number;
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'skill_start': return '▶';
    case 'skill_complete': return '✓';
    case 'task_progress': return '◇';
    case 'git_commit': return '●';
    case 'observation': return '○';
    case 'decision': return '◆';
    case 'snapshot': return '◈';
    default: return '•';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'skill_start': return '#22cc44';
    case 'skill_complete': return '#22cc44';
    case 'git_commit': return '#fbbf24';
    case 'observation': return '#00bbcc';
    case 'decision': return '#aa88ff';
    case 'snapshot': return '#ff88aa';
    default: return terminalColors.textMuted;
  }
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return ts;
  }
}

export function Timeline(props: TimelineProps) {
  const [loading, setLoading] = createSignal(true);
  const [result, setResult] = createSignal<TimelineResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const rows = () => props.rows ?? 24;
  const visibleCount = () => Math.max(1, rows() - 10);

  const loadTimeline = () => {
    setLoading(true);
    setError(null);

    try {
      execFile('npx', ['skillkit', 'timeline', '--json'], {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }, (err, stdout, stderr) => {
        setLoading(false);
        if (err && !stdout) {
          setError(stderr || err.message || 'Failed to load timeline');
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as TimelineResult;
          setResult(parsed);
        } catch {
          setError('Failed to parse timeline data');
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    }
  };

  createEffect(() => {
    loadTimeline();
  });

  const events = createMemo(() => result()?.events ?? []);
  const windowStart = createMemo(() => Math.max(0, selectedIndex() - visibleCount() + 1));
  const visibleEvents = createMemo(() =>
    events().slice(windowStart(), windowStart() + visibleCount())
  );

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'k' || key.name === 'up') {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.name === 'j' || key.name === 'down') {
      setSelectedIndex(i => events().length > 0 ? Math.min(events().length - 1, i + 1) : 0);
    } else if (key.name === 'r') {
      loadTimeline();
    } else if (key.name === 'escape') {
      props.onNavigate('home');
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <Header
        title="Timeline"
        subtitle="unified event stream"
        count={result()?.totalCount}
        icon="▸"
      />

      <Show when={loading()}>
        <Spinner label="Loading timeline..." />
      </Show>

      <Show when={error()}>
        <box flexDirection="column">
          <text fg="#ff5555">Error: {error()}</text>
          <text fg={terminalColors.textMuted}>Press r to retry</text>
        </box>
      </Show>

      <Show when={!loading() && !error()}>
        <Show when={events().length === 0}>
          <EmptyState
            title="No timeline events"
            description="Events appear as you execute skills and make commits"
          />
        </Show>

        <Show when={events().length > 0}>
          <For each={visibleEvents()}>
            {(event, idx) => {
              const absoluteIdx = () => windowStart() + idx();
              const isSelected = () => absoluteIdx() === selectedIndex();
              return (
                <box flexDirection="column">
                  <box flexDirection="row" gap={1}>
                    <text fg={isSelected() ? terminalColors.accent : terminalColors.textMuted}>
                      {isSelected() ? '>' : ' '}
                    </text>
                    <text fg={terminalColors.textMuted} width={9}>
                      {formatTimestamp(event.timestamp)}
                    </text>
                    <text fg={getTypeColor(event.type)}>
                      {getTypeIcon(event.type)}
                    </text>
                    <text fg={isSelected() ? terminalColors.text : terminalColors.textMuted}>
                      {event.summary}
                    </text>
                  </box>
                  <Show when={isSelected() && event.source}>
                    <text fg={terminalColors.textMuted}>
                      {'              '}source: {event.source}
                    </text>
                  </Show>
                </box>
              );
            }}
          </For>
        </Show>
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>j/k navigate  r refresh  esc back</text>
    </box>
  );
}

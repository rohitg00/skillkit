import { createSignal, createEffect, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState } from '../components/EmptyState.js';
import { execFile } from 'node:child_process';

function changeTypeLabel(changeType: string): string {
  switch (changeType) {
    case 'modified': return 'M';
    case 'created': return 'A';
    default: return 'D';
  }
}

interface HandoffProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface HandoffTask {
  name: string;
  duration?: string;
  commitSha?: string;
}

interface HandoffCommit {
  sha: string;
  message: string;
  filesCount: number;
}

interface HandoffResult {
  generatedAt: string;
  fromAgent: string;
  projectPath: string;
  accomplished: { tasks: HandoffTask[]; commits: HandoffCommit[] };
  pending: { tasks: HandoffTask[]; commits: HandoffCommit[] };
  keyFiles: Array<{ path: string; changeType: string }>;
  observations: {
    errors: Array<{ action: string; error: string }>;
    solutions: Array<{ action: string; solution: string }>;
    patterns: Array<{ action: string; context: string }>;
  };
  recommendations: string[];
}

type SectionView = 'accomplished' | 'pending' | 'files' | 'recommendations';

export function Handoff(props: HandoffProps) {
  const [loading, setLoading] = createSignal(true);
  const [result, setResult] = createSignal<HandoffResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [section, setSection] = createSignal<SectionView>('accomplished');

  const loadHandoff = () => {
    setLoading(true);
    setError(null);

    try {
      execFile('npx', ['skillkit', 'session', 'handoff', '--json'], {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }, (err, stdout, stderr) => {
        setLoading(false);
        if (err && !stdout) {
          setError(stderr || err.message || 'Failed to generate handoff');
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as HandoffResult;
          setResult(parsed);
        } catch {
          setError('Failed to parse handoff data');
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to generate handoff');
    }
  };

  createEffect(() => {
    loadHandoff();
  });

  const sections: SectionView[] = ['accomplished', 'pending', 'files', 'recommendations'];

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'tab') {
      const idx = sections.indexOf(section());
      setSection(sections[(idx + 1) % sections.length]);
    } else if (key.name === 'r') {
      loadHandoff();
    } else if (key.name === 'escape') {
      props.onNavigate('home');
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <Header
        title="Handoff"
        subtitle="agent-to-agent context transfer"
        icon="⇄"
      />

      <Show when={loading()}>
        <Spinner label="Generating handoff document..." />
      </Show>

      <Show when={error()}>
        <box flexDirection="column">
          <text fg="#ff5555">Error: {error()}</text>
          <text fg={terminalColors.textMuted}>Press r to retry</text>
        </box>
      </Show>

      <Show when={!loading() && !error() && result()}>
        <box flexDirection="row" gap={1} marginBottom={1}>
          <text fg={terminalColors.textMuted}>from:</text>
          <text fg={terminalColors.text}>{result()!.fromAgent}</text>
          <text fg={terminalColors.textMuted}>|</text>
          <text fg={terminalColors.textMuted}>{result()!.generatedAt}</text>
        </box>

        <box flexDirection="row" gap={2} marginBottom={1}>
          <For each={sections}>
            {(s) => (
              <text
                fg={section() === s ? terminalColors.accent : terminalColors.textMuted}
                bold={section() === s}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </text>
            )}
          </For>
          <text fg={terminalColors.textMuted}>(Tab to switch)</text>
        </box>

        <text fg={terminalColors.textMuted}>{'─'.repeat(Math.min(60, (props.cols ?? 80) - 4))}</text>

        <Show when={section() === 'accomplished'}>
          <text fg={terminalColors.text} bold>Accomplished Tasks</text>
          <text> </text>
          <Show when={result()!.accomplished.tasks.length === 0}>
            <EmptyState title="No accomplished tasks in this session" />
          </Show>
          <For each={result()!.accomplished.tasks}>
            {(task) => (
              <box flexDirection="row" gap={1}>
                <text fg="#22cc44">✓</text>
                <text fg={terminalColors.text}>{task.name}</text>
                <Show when={task.duration}>
                  <text fg={terminalColors.textMuted}>({task.duration})</text>
                </Show>
              </box>
            )}
          </For>
          <Show when={result()!.accomplished.commits.length > 0}>
            <text> </text>
            <text fg={terminalColors.text} bold>Commits</text>
            <For each={result()!.accomplished.commits}>
              {(commit) => (
                <box flexDirection="row" gap={1}>
                  <text fg="#fbbf24">●</text>
                  <text fg={terminalColors.textMuted}>{commit.sha.slice(0, 7)}</text>
                  <text fg={terminalColors.text}>{commit.message}</text>
                </box>
              )}
            </For>
          </Show>
        </Show>

        <Show when={section() === 'pending'}>
          <text fg={terminalColors.text} bold>Pending Tasks</text>
          <text> </text>
          <Show when={result()!.pending.tasks.length === 0}>
            <EmptyState title="No pending tasks" />
          </Show>
          <For each={result()!.pending.tasks}>
            {(task) => (
              <box flexDirection="row" gap={1}>
                <text fg="#ffaa00">○</text>
                <text fg={terminalColors.text}>{task.name}</text>
              </box>
            )}
          </For>
        </Show>

        <Show when={section() === 'files'}>
          <text fg={terminalColors.text} bold>Key Files</text>
          <text> </text>
          <Show when={result()!.keyFiles.length === 0}>
            <EmptyState title="No key files tracked" />
          </Show>
          <For each={result()!.keyFiles}>
            {(file) => (
              <box flexDirection="row" gap={1}>
                <text fg={terminalColors.textMuted}>{changeTypeLabel(file.changeType)}</text>
                <text fg={terminalColors.text}>{file.path}</text>
              </box>
            )}
          </For>
        </Show>

        <Show when={section() === 'recommendations'}>
          <text fg={terminalColors.text} bold>Recommendations</text>
          <text> </text>
          <Show when={result()!.recommendations.length === 0}>
            <EmptyState title="No recommendations" />
          </Show>
          <For each={result()!.recommendations}>
            {(rec) => (
              <box flexDirection="row" gap={1}>
                <text fg={terminalColors.accent}>→</text>
                <text fg={terminalColors.text}>{rec}</text>
              </box>
            )}
          </For>
        </Show>
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>Tab switch section  r refresh  esc back</text>
    </box>
  );
}

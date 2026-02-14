import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState } from '../components/EmptyState.js';
import { execFile } from 'node:child_process';

interface LineageProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface SkillLineageEntry {
  skillName: string;
  executions: number;
  totalDurationMs: number;
  commits: string[];
  filesModified: string[];
  firstSeen: string;
  lastSeen: string;
}

interface FileLineage {
  path: string;
  skills: string[];
  commitCount: number;
  lastModified: string;
}

interface LineageResult {
  projectPath: string;
  skills: SkillLineageEntry[];
  files: FileLineage[];
  stats: {
    totalSkillExecutions: number;
    totalCommits: number;
    totalFilesChanged: number;
    mostImpactfulSkill: string | null;
    mostChangedFile: string | null;
    errorProneFiles: string[];
  };
}

type ViewMode = 'skills' | 'files';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function Lineage(props: LineageProps) {
  const [loading, setLoading] = createSignal(true);
  const [result, setResult] = createSignal<LineageResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [viewMode, setViewMode] = createSignal<ViewMode>('skills');

  const rows = () => props.rows ?? 24;
  const visibleCount = () => Math.max(1, rows() - 14);

  const loadLineage = () => {
    setLoading(true);
    setError(null);

    try {
      execFile('npx', ['skillkit', 'lineage', '--json'], {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }, (err, stdout, stderr) => {
        setLoading(false);
        if (err && !stdout) {
          setError(stderr || err.message || 'Failed to load lineage');
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as LineageResult;
          setResult(parsed);
        } catch {
          setError('Failed to parse lineage data');
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to load lineage');
    }
  };

  createEffect(() => {
    loadLineage();
  });

  const items = createMemo(() => {
    if (viewMode() === 'skills') return result()?.skills ?? [];
    return result()?.files ?? [];
  });

  const windowStart = createMemo(() => Math.max(0, selectedIndex() - visibleCount() + 1));
  const visibleItems = createMemo(() =>
    items().slice(windowStart(), windowStart() + visibleCount())
  );

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'k' || key.name === 'up') {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.name === 'j' || key.name === 'down') {
      setSelectedIndex(i => items().length > 0 ? Math.min(items().length - 1, i + 1) : 0);
    } else if (key.name === 'tab') {
      setViewMode(m => m === 'skills' ? 'files' : 'skills');
      setSelectedIndex(0);
    } else if (key.name === 'r') {
      loadLineage();
    } else if (key.name === 'escape') {
      props.onNavigate('home');
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <Header
        title="Lineage"
        subtitle="skill impact graph"
        icon="◉"
      />

      <Show when={loading()}>
        <Spinner label="Loading lineage..." />
      </Show>

      <Show when={error()}>
        <box flexDirection="column">
          <text fg="#ff5555">Error: {error()}</text>
          <text fg={terminalColors.textMuted}>Press r to retry</text>
        </box>
      </Show>

      <Show when={!loading() && !error() && result()}>
        <box flexDirection="row" gap={2} marginBottom={1}>
          <text fg={terminalColors.text}>{result()!.stats.totalSkillExecutions} executions</text>
          <text fg={terminalColors.textMuted}>|</text>
          <text fg={terminalColors.text}>{result()!.stats.totalCommits} commits</text>
          <text fg={terminalColors.textMuted}>|</text>
          <text fg={terminalColors.text}>{result()!.stats.totalFilesChanged} files</text>
          <Show when={result()!.stats.mostImpactfulSkill}>
            <text fg={terminalColors.textMuted}>|</text>
            <text fg="#22cc44">top: {result()!.stats.mostImpactfulSkill}</text>
          </Show>
        </box>

        <box flexDirection="row" gap={2} marginBottom={1}>
          <text
            fg={viewMode() === 'skills' ? terminalColors.accent : terminalColors.textMuted}
            bold={viewMode() === 'skills'}
          >
            Skills ({result()?.skills?.length ?? 0})
          </text>
          <text
            fg={viewMode() === 'files' ? terminalColors.accent : terminalColors.textMuted}
            bold={viewMode() === 'files'}
          >
            Files ({result()?.files?.length ?? 0})
          </text>
          <text fg={terminalColors.textMuted}>(Tab to switch)</text>
        </box>

        <text fg={terminalColors.textMuted}>{'─'.repeat(Math.min(60, (props.cols ?? 80) - 4))}</text>

        <Show when={items().length === 0}>
          <EmptyState
            title={viewMode() === 'skills' ? 'No skill lineage data' : 'No file lineage data'}
            description="Execute skills to build lineage history"
          />
        </Show>

        <Show when={items().length > 0}>
          <For each={visibleItems()}>
            {(item, idx) => {
              const absoluteIdx = () => windowStart() + idx();
              const isSelected = () => absoluteIdx() === selectedIndex();

              return (
                <box flexDirection="column">
                  <Show when={viewMode() === 'skills'}>
                    {(() => {
                      const skill = item as SkillLineageEntry;
                      return (
                        <box flexDirection="row" gap={1}>
                          <text fg={isSelected() ? terminalColors.accent : terminalColors.textMuted}>
                            {isSelected() ? '>' : ' '}
                          </text>
                          <text fg={isSelected() ? terminalColors.text : terminalColors.textMuted} width={24}>
                            {skill.skillName}
                          </text>
                          <text fg={terminalColors.textMuted} width={8}>
                            {skill.executions}x
                          </text>
                          <text fg={terminalColors.textMuted} width={8}>
                            {formatDuration(skill.totalDurationMs)}
                          </text>
                          <text fg="#fbbf24" width={8}>
                            {skill.commits.length} commits
                          </text>
                          <text fg={terminalColors.textMuted}>
                            {skill.filesModified.length} files
                          </text>
                        </box>
                      );
                    })()}
                  </Show>
                  <Show when={viewMode() === 'files'}>
                    {(() => {
                      const file = item as FileLineage;
                      return (
                        <box flexDirection="row" gap={1}>
                          <text fg={isSelected() ? terminalColors.accent : terminalColors.textMuted}>
                            {isSelected() ? '>' : ' '}
                          </text>
                          <text fg={isSelected() ? terminalColors.text : terminalColors.textMuted} width={36}>
                            {file.path}
                          </text>
                          <text fg="#fbbf24" width={10}>
                            {file.commitCount} commits
                          </text>
                          <text fg={terminalColors.textMuted}>
                            {file.skills.join(', ')}
                          </text>
                        </box>
                      );
                    })()}
                  </Show>
                </box>
              );
            }}
          </For>
        </Show>
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>j/k navigate  Tab switch view  r refresh  esc back</text>
    </box>
  );
}

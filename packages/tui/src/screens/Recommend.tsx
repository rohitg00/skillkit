import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import { DetailPane } from '../components/DetailPane.js';
import {
  getRecommendations,
  analyzeProject,
  type RecommendServiceState,
  type RecommendationDisplay,
} from '../services/recommend.service.js';

interface RecommendProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Recommend(props: RecommendProps) {
  const [state, setState] = createSignal<RecommendServiceState>({
    recommendations: [],
    analyzing: false,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);
  const [projectInfo, setProjectInfo] = createSignal<{
    languages: string[];
    frameworks: string[];
  } | null>(null);

  const rows = () => props.rows ?? 24;

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, analyzing: true, error: null }));

    try {
      const analysis = await analyzeProject();
      if (analysis) {
        setProjectInfo({
          languages: analysis.languages,
          frameworks: analysis.frameworks,
        });
      }

      const result = await getRecommendations();
      setState(result);

      const maxIndex = Math.max(0, result.recommendations.length - 1);
      setSelectedIndex((prev) => Math.max(0, Math.min(prev, maxIndex)));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        analyzing: false,
        error: err instanceof Error ? err.message : 'Failed to load recommendations',
      }));
    }
  };

  const handleRefresh = async () => {
    loadData();
  };

  const handleInstall = () => {
    const recs = state().recommendations;
    if (recs.length === 0) return;

    const rec = recs[selectedIndex()];
    if (rec) {
      props.onNavigate('installed');
    }
  };

  const handleKeyNav = (delta: number) => {
    const max = state().recommendations.length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') {
      if (showDetail()) handleInstall();
      else setShowDetail(true);
    } else if (key.name === 'r') handleRefresh();
    else if (key.name === 'escape') {
      if (showDetail()) setShowDetail(false);
      else props.onNavigate('home');
    }
  });

  const getScoreColor = (score: number): string => {
    if (score >= 80) return terminalColors.success;
    if (score >= 60) return terminalColors.accent;
    if (score >= 40) return terminalColors.warning;
    return terminalColors.textMuted;
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const selectedRec = () => {
    const recs = state().recommendations;
    if (recs.length === 0) return null;
    return recs[selectedIndex()];
  };

  const detailFields = () => {
    const rec = selectedRec();
    if (!rec) return [];

    return [
      { label: 'Name', value: rec.name },
      { label: 'Score', value: `${rec.score}%` },
      { label: 'Source', value: rec.source },
      { label: 'Tags', value: rec.tags.join(', ') || 'None' },
      { label: 'Install', value: rec.installCommand || `skillkit install ${rec.name}` },
    ];
  };

  const maxVisible = () => Math.max(4, Math.floor((rows() - 12) / 3));

  const recsWindow = createMemo(() => {
    const list = state().recommendations;
    const selected = selectedIndex();
    const visible = maxVisible();
    const total = list.length;
    if (total <= visible) return { start: 0, items: list };
    let start = Math.max(0, selected - Math.floor(visible / 2));
    start = Math.min(start, total - visible);
    return { start, items: list.slice(start, start + visible) };
  });

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Recommendations"
        subtitle="AI skill suggestions based on your project"
        icon="✦"
        count={state().recommendations.length}
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading && state().analyzing}>
        <box flexDirection="column">
          <Spinner label="Analyzing your project..." />
          <Show when={projectInfo()}>
            <text> </text>
            <text fg={terminalColors.textMuted}>
              Detected: {projectInfo()!.languages.slice(0, 3).join(', ')}
              {projectInfo()!.frameworks.length > 0
                ? ` + ${projectInfo()!.frameworks.slice(0, 2).join(', ')}`
                : ''}
            </text>
          </Show>
        </box>
      </Show>

      <Show when={!state().loading && !state().error}>
        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <Show when={projectInfo()}>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted}>Stack: </text>
                <text fg={terminalColors.accent}>
                  {[
                    ...projectInfo()!.languages.slice(0, 2),
                    ...projectInfo()!.frameworks.slice(0, 2),
                  ].join(' • ')}
                </text>
              </box>
            </Show>

            <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
            <text> </text>

            <Show
              when={state().recommendations.length > 0}
              fallback={
                <EmptyState
                  icon="✦"
                  title="No recommendations found"
                  description="Try refreshing to analyze your project again"
                  action={{ label: 'Refresh', key: 'r' }}
                />
              }
            >
              <text fg={terminalColors.text}>
                <b>Suggested Skills</b>
              </text>
              <text> </text>

              <Show when={recsWindow().start > 0}>
                <text fg={terminalColors.textMuted}>  ▲ {recsWindow().start} more</text>
              </Show>
              <For each={recsWindow().items}>
                {(rec, idx) => {
                  const originalIndex = () => recsWindow().start + idx();
                  const isSelected = () => originalIndex() === selectedIndex();
                  return (
                    <box flexDirection="column" marginBottom={1}>
                      <box flexDirection="row">
                        <text
                          fg={isSelected() ? terminalColors.accent : terminalColors.text}
                          width={3}
                        >
                          {isSelected() ? '▸ ' : '  '}
                        </text>
                        <text
                          fg={isSelected() ? terminalColors.accent : terminalColors.text}
                          width={25}
                        >
                          {rec.name}
                        </text>
                        <text fg={getScoreColor(rec.score)} width={6}>
                          {rec.score}%
                        </text>
                        <text fg={getScoreColor(rec.score)} width={4}>
                          [{getGrade(rec.score)}]
                        </text>
                      </box>
                      <Show when={rec.reasons.length > 0}>
                        <text fg={terminalColors.textMuted}>
                          {'   '}{rec.reasons[0]}
                        </text>
                      </Show>
                      <Show when={rec.description && rec.reasons.length === 0}>
                        <text fg={terminalColors.textMuted}>
                          {'   '}{rec.description.slice(0, 50)}
                          {rec.description.length > 50 ? '...' : ''}
                        </text>
                      </Show>
                    </box>
                  );
                }}
              </For>

              <Show when={recsWindow().start + maxVisible() < state().recommendations.length}>
                <text fg={terminalColors.textMuted}>
                  ▼ {state().recommendations.length - recsWindow().start - maxVisible()} more
                </text>
              </Show>
            </Show>

            <Show when={state().lastAnalyzed}>
              <text> </text>
              <text fg={terminalColors.textMuted}>
                Last analyzed: {new Date(state().lastAnalyzed!).toLocaleTimeString()}
              </text>
            </Show>
          </box>

          <Show when={showDetail() && selectedRec()}>
            <DetailPane
              title={selectedRec()!.name}
              subtitle={`Score: ${selectedRec()!.score}%`}
              icon="✦"
              fields={detailFields()}
              actions={[
                { key: 'Enter', label: 'Install' },
                { key: 'Esc', label: 'Close' },
              ]}
              width={35}
              visible={showDetail()}
              onClose={() => setShowDetail(false)}
            />
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter details/install  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

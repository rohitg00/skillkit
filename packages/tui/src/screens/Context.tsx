import { createSignal, createEffect, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  loadProjectContext,
  analyzeProjectContext,
  refreshContext,
  exportContext,
  getStackTags,
  type ContextServiceState,
} from '../services/context.service.js';

interface ContextProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Context(props: ContextProps) {
  const [state, setState] = createSignal<ContextServiceState>({
    context: null,
    stack: null,
    loading: true,
    analyzing: false,
    error: null,
  });
  const [tags, setTags] = createSignal<string[]>([]);
  const [selectedSection, setSelectedSection] = createSignal(0);

  const sections = ['Overview', 'Languages', 'Frameworks', 'Libraries', 'Patterns'];

  const moveSection = (delta: number) => {
    setSelectedSection((i) =>
      Math.max(0, Math.min(sections.length - 1, i + delta))
    );
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'h' || key.name === 'left') moveSection(-1);
    else if (key.name === 'l' || key.name === 'right') moveSection(1);
    else if (key.name === 'r') handleRefresh();
    else if (key.name === 'e') handleExport();
    else if (key.name === 'escape') props.onNavigate('home');
  });

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      let result = await loadProjectContext();
      if (!result.context) {
        result = await analyzeProjectContext();
      }
      setState(result);
      setTags(await getStackTags());
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        analyzing: false,
        error: err instanceof Error ? err.message : 'Failed to load context',
      }));
    }
  };

  const handleRefresh = async () => {
    setState((s) => ({ ...s, analyzing: true, error: null }));
    try {
      const result = await refreshContext();
      setState(result);
      setTags(await getStackTags());
    } catch (err) {
      setState((s) => ({
        ...s,
        analyzing: false,
        error: err instanceof Error ? err.message : 'Failed to refresh context',
      }));
    }
  };

  const handleExport = async () => {
    try {
      await exportContext(undefined, 'json');
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to export context',
      }));
    }
  };

  const currentSection = () => sections[selectedSection()];
  const ctx = () => state().context;

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Project Context"
        subtitle="Analyze your project environment"
        icon="◉"
        count={tags().length}
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading || state().analyzing}>
        <Spinner
          label={state().analyzing ? 'Analyzing project...' : 'Loading context...'}
        />
      </Show>

      <Show when={!state().loading && !state().error && ctx()}>
        <box flexDirection="column">
          <box flexDirection="row" marginBottom={1}>
            <For each={sections}>
              {(section, idx) => (
                <box marginRight={2}>
                  <text
                    fg={
                      idx() === selectedSection()
                        ? terminalColors.accent
                        : terminalColors.textMuted
                    }
                  >
                    {idx() === selectedSection() ? '▸ ' : '  '}
                    {section}
                  </text>
                </box>
              )}
            </For>
          </box>

          <text fg={terminalColors.textMuted}>─────────────────────────────</text>
          <text> </text>

          <Show when={currentSection() === 'Overview'}>
            <box flexDirection="column">
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted} width={18}>Project:</text>
                <text fg={terminalColors.text}>{ctx()!.projectName}</text>
              </box>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted} width={18}>Path:</text>
                <text fg={terminalColors.textSecondary}>{ctx()!.rootPath}</text>
              </box>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted} width={18}>Languages:</text>
                <text fg={terminalColors.accent}>{ctx()!.languages.length}</text>
              </box>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted} width={18}>Frameworks:</text>
                <text fg={terminalColors.accent}>{ctx()!.frameworks.length}</text>
              </box>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted} width={18}>Libraries:</text>
                <text fg={terminalColors.accent}>{ctx()!.libraries.length}</text>
              </box>
              <Show when={ctx()!.lastUpdated}>
                <box flexDirection="row" marginBottom={1}>
                  <text fg={terminalColors.textMuted} width={18}>Last Updated:</text>
                  <text fg={terminalColors.textSecondary}>{ctx()!.lastUpdated}</text>
                </box>
              </Show>
            </box>
          </Show>

          <Show when={currentSection() === 'Languages'}>
            <box flexDirection="column">
              <Show
                when={ctx()!.languages.length > 0}
                fallback={<EmptyState title="No languages detected" compact />}
              >
                <For each={ctx()!.languages}>
                  {(lang) => (
                    <box marginBottom={1}>
                      <text fg={terminalColors.text}>
                        • {lang}
                      </text>
                    </box>
                  )}
                </For>
              </Show>
            </box>
          </Show>

          <Show when={currentSection() === 'Frameworks'}>
            <box flexDirection="column">
              <Show
                when={ctx()!.frameworks.length > 0}
                fallback={<EmptyState title="No frameworks detected" compact />}
              >
                <For each={ctx()!.frameworks}>
                  {(fw) => (
                    <box marginBottom={1}>
                      <text fg={terminalColors.text}>
                        • {fw}
                      </text>
                    </box>
                  )}
                </For>
              </Show>
            </box>
          </Show>

          <Show when={currentSection() === 'Libraries'}>
            <box flexDirection="column">
              <Show
                when={ctx()!.libraries.length > 0}
                fallback={<EmptyState title="No libraries detected" compact />}
              >
                <For each={ctx()!.libraries.slice(0, 15)}>
                  {(lib) => (
                    <box marginBottom={1}>
                      <text fg={terminalColors.text}>
                        • {lib}
                      </text>
                    </box>
                  )}
                </For>
                <Show when={ctx()!.libraries.length > 15}>
                  <text fg={terminalColors.textMuted}>
                    +{ctx()!.libraries.length - 15} more
                  </text>
                </Show>
              </Show>
            </box>
          </Show>

          <Show when={currentSection() === 'Patterns'}>
            <box flexDirection="column">
              <Show
                when={Object.keys(ctx()!.patterns).length > 0}
                fallback={<EmptyState title="No patterns detected" compact />}
              >
                <For each={Object.entries(ctx()!.patterns)}>
                  {([key, value]) => (
                    <box flexDirection="row" marginBottom={1}>
                      <text fg={terminalColors.textMuted} width={18}>{key}:</text>
                      <text fg={terminalColors.text}>{String(value)}</text>
                    </box>
                  )}
                </For>
              </Show>
            </box>
          </Show>

          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────</text>
          <text> </text>

          <Show when={tags().length > 0}>
            <box flexDirection="row" flexWrap="wrap">
              <text fg={terminalColors.textMuted}>Tags: </text>
              <For each={tags().slice(0, 8)}>
                {(tag, idx) => (
                  <text fg={terminalColors.textSecondary}>
                    {tag}
                    {idx() < Math.min(tags().length, 8) - 1 ? ', ' : ''}
                  </text>
                )}
              </For>
              <Show when={tags().length > 8}>
                <text fg={terminalColors.textMuted}> +{tags().length - 8}</text>
              </Show>
            </box>
          </Show>
        </box>
      </Show>

      <Show when={!state().loading && !state().error && !ctx()}>
        <EmptyState
          icon="◉"
          title="No context found"
          description="Run analysis to detect project context"
          action={{ label: 'Analyze', key: 'r' }}
        />
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>
        ←/→ sections  r refresh  e export  Esc back
      </text>
    </box>
  );
}

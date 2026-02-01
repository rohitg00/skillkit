import { createSignal, createEffect, Show, For } from 'solid-js';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { DetailPane } from '../components/DetailPane.js';
import {
  loadMemories,
  deleteMemoryEntry,
  clearMemory,
  initializeMemory,
  type MemoryServiceState,
  type MemoryEntry,
} from '../services/memory.service.js';

interface MemoryProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Memory(props: MemoryProps) {
  const [state, setState] = createSignal<MemoryServiceState>({
    entries: [],
    status: null,
    paths: null,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await loadMemories();
      setState(result);
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load memories',
      }));
    }
  };

  const handleDelete = async () => {
    const entries = state().entries;
    if (entries.length === 0) return;

    const entry = entries[selectedIndex()];
    if (!entry) return;

    try {
      const success = await deleteMemoryEntry(entry.key);
      if (success) {
        loadData();
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to delete entry',
      }));
    }
  };

  const handleClearAll = async () => {
    try {
      const success = await clearMemory(undefined, 'all');
      if (success) {
        loadData();
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to clear memory',
      }));
    }
  };

  const handleInitialize = async () => {
    try {
      const success = await initializeMemory();
      if (success) {
        loadData();
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to initialize memory',
      }));
    }
  };

  const getTypeIcon = (type: MemoryEntry['type']): string => {
    switch (type) {
      case 'index':
        return '◈';
      case 'learning':
        return '◇';
      case 'observation':
        return '○';
      default:
        return '•';
    }
  };

  const selectedEntry = () => {
    const entries = state().entries;
    if (entries.length === 0) return null;
    return entries[selectedIndex()];
  };

  const detailFields = () => {
    const entry = selectedEntry();
    if (!entry) return [];

    return [
      { label: 'Key', value: entry.key },
      { label: 'Type', value: entry.type },
      { label: 'Size', value: entry.size },
      { label: 'Updated', value: entry.updated },
    ];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Memory"
        subtitle="Manage persistent session memory"
        count={state().entries.length}
        icon="◎"
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading}>
        <Spinner label="Loading memories..." />
      </Show>

      <Show when={!state().loading && !state().error}>
        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <Show when={state().status}>
              <box flexDirection="row" marginBottom={1}>
                <text fg={terminalColors.textMuted}>Status: </text>
                <text
                  fg={
                    state().status?.projectMemoryExists || state().status?.globalMemoryExists
                      ? terminalColors.success
                      : terminalColors.warning
                  }
                >
                  {state().status?.projectMemoryExists ? 'Project ✓' : 'Project ✗'}
                </text>
                <text fg={terminalColors.textMuted}> | </text>
                <text
                  fg={state().status?.globalMemoryExists ? terminalColors.success : terminalColors.warning}
                >
                  {state().status?.globalMemoryExists ? 'Global ✓' : 'Global ✗'}
                </text>
              </box>
            </Show>

            <text fg={terminalColors.textMuted}>─────────────────────────────</text>
            <text> </text>

            <Show
              when={state().entries.length > 0}
              fallback={
                <EmptyState
                  icon="◎"
                  title="No memories stored"
                  description="Memory will be created as you use skills"
                  action={{ label: 'Initialize', key: 'i' }}
                />
              }
            >
              <text fg={terminalColors.text}><b>Stored Memories</b></text>
              <text> </text>

              <For each={state().entries}>
                {(mem, idx) => (
                  <box flexDirection="row" marginBottom={1}>
                    <text
                      fg={idx() === selectedIndex() ? terminalColors.accent : terminalColors.text}
                      width={3}
                    >
                      {idx() === selectedIndex() ? '▸ ' : '  '}
                    </text>
                    <text
                      fg={idx() === selectedIndex() ? terminalColors.accent : terminalColors.text}
                    >
                      {getTypeIcon(mem.type)}{' '}
                    </text>
                    <text
                      fg={idx() === selectedIndex() ? terminalColors.accent : terminalColors.text}
                      width={20}
                    >
                      {mem.key}
                    </text>
                    <text fg={terminalColors.textMuted} width={12}>
                      {mem.size}
                    </text>
                    <text fg={terminalColors.textMuted}>{mem.updated}</text>
                  </box>
                )}
              </For>
            </Show>
          </box>

          <Show when={showDetail() && selectedEntry()}>
            <DetailPane
              title={selectedEntry()!.key}
              icon={getTypeIcon(selectedEntry()!.type)}
              fields={detailFields()}
              actions={[
                { key: 'd', label: 'Delete' },
                { key: 'Esc', label: 'Close' },
              ]}
              width={30}
              visible={showDetail()}
              onClose={() => setShowDetail(false)}
            />
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────</text>
        <text> </text>

        <Show when={state().paths}>
          <text fg={terminalColors.textMuted}>
            Project: {state().paths?.projectMemoryDir || 'Not initialized'}
          </text>
          <text fg={terminalColors.textMuted}>
            Global: {state().paths?.globalMemoryDir || 'Not initialized'}
          </text>
        </Show>
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>
        j/k navigate  Enter view  d delete  c clear all  i init  Esc back
      </text>
    </box>
  );
}

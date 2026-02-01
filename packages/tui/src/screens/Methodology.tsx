import { createSignal, createEffect, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { DetailPane } from '../components/DetailPane.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  loadMethodologies,
  installMethodologyPack,
  uninstallMethodologyPack,
  syncMethodologyPack,
  type MethodologyServiceState,
  type MethodologyPackDisplay,
} from '../services/methodology.service.js';

interface MethodologyProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Methodology(props: MethodologyProps) {
  const [state, setState] = createSignal<MethodologyServiceState>({
    packs: [],
    installedPacks: [],
    manager: null,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);
  const [installing, setInstalling] = createSignal(false);
  const [syncing, setSyncing] = createSignal(false);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await loadMethodologies();
    setState(result);
  };

  const handleInstall = async () => {
    const packs = state().packs;
    if (packs.length === 0) return;

    const pack = packs[selectedIndex()];
    if (!pack || pack.installed) return;

    setInstalling(true);
    const result = await installMethodologyPack(pack.name);
    if (result) {
      await loadData();
    }
    setInstalling(false);
  };

  const handleUninstall = async () => {
    const packs = state().packs;
    if (packs.length === 0) return;

    const pack = packs[selectedIndex()];
    if (!pack || !pack.installed) return;

    setInstalling(true);
    const success = await uninstallMethodologyPack(pack.name);
    if (success) {
      await loadData();
    }
    setInstalling(false);
  };

  const handleSync = async () => {
    const packs = state().packs;
    if (packs.length === 0) return;

    const pack = packs[selectedIndex()];
    if (!pack || !pack.installed) return;

    setSyncing(true);
    const result = await syncMethodologyPack(pack.name);
    if (result) {
      await loadData();
    }
    setSyncing(false);
  };

  const handleKeyNav = (delta: number) => {
    const max = state().packs.length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') setShowDetail(true);
    else if (key.name === 'i') handleInstall();
    else if (key.name === 'u') handleUninstall();
    else if (key.name === 's') handleSync();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (showDetail()) setShowDetail(false);
      else props.onNavigate('home');
    }
  });

  const getStatusIcon = (status: MethodologyPackDisplay['status']): string => {
    switch (status) {
      case 'synced':
        return '✓';
      case 'installed':
        return '●';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: MethodologyPackDisplay['status']): string => {
    switch (status) {
      case 'synced':
        return terminalColors.success;
      case 'installed':
        return terminalColors.accent;
      default:
        return terminalColors.textMuted;
    }
  };

  const selectedPack = () => {
    const packs = state().packs;
    if (packs.length === 0) return null;
    return packs[selectedIndex()];
  };

  const detailFields = () => {
    const pack = selectedPack();
    if (!pack) return [];

    return [
      { label: 'Name', value: pack.name },
      { label: 'Version', value: pack.version },
      { label: 'Description', value: pack.description || 'No description' },
      { label: 'Skills', value: String(pack.skills) },
      { label: 'Tags', value: pack.tags.join(', ') || 'None' },
      { label: 'Status', value: pack.status },
    ];
  };

  const installedCount = () => state().packs.filter((p) => p.installed).length;

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Methodologies"
        subtitle="Development methodology skill packs"
        count={state().packs.length}
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
        <Spinner label="Loading methodologies..." />
      </Show>

      <Show when={!state().loading && !state().error}>
        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <box flexDirection="row" marginBottom={1}>
              <text fg={terminalColors.textMuted}>Installed: </text>
              <text fg={terminalColors.success}>{installedCount()}</text>
              <text fg={terminalColors.textMuted}> / </text>
              <text fg={terminalColors.text}>{state().packs.length}</text>
              <text fg={terminalColors.textMuted}> packs</text>
            </box>

            <text fg={terminalColors.textMuted}>─────────────────────────────</text>
            <text> </text>

            <Show
              when={state().packs.length > 0}
              fallback={
                <EmptyState
                  icon="◎"
                  title="No methodology packs found"
                  description="Check .skillkit/methodology/packs/"
                />
              }
            >
              <text fg={terminalColors.text}>
                <b>Available Packs</b>
              </text>
              <text> </text>

              <For each={state().packs}>
                {(pack, idx) => {
                  const selected = () => idx() === selectedIndex();
                  return (
                    <box flexDirection="column" marginBottom={1}>
                      <box flexDirection="row">
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
                          {pack.name}
                        </text>
                        <text fg={terminalColors.textMuted} width={8}>
                          v{pack.version}
                        </text>
                        <text fg={terminalColors.textMuted} width={10}>
                          {pack.skills} skills
                        </text>
                        <text fg={getStatusColor(pack.status)}>
                          {getStatusIcon(pack.status)} {pack.status}
                        </text>
                      </box>
                      <Show when={pack.description}>
                        <text fg={terminalColors.textMuted}>
                          {'   '}{pack.description.slice(0, 45)}
                          {pack.description.length > 45 ? '...' : ''}
                        </text>
                      </Show>
                    </box>
                  );
                }}
              </For>
            </Show>

            <Show when={installing()}>
              <text> </text>
              <StatusIndicator
                status="loading"
                label={selectedPack()?.installed ? 'Uninstalling...' : 'Installing...'}
              />
            </Show>

            <Show when={syncing()}>
              <text> </text>
              <StatusIndicator status="loading" label="Syncing to agents..." />
            </Show>
          </box>

          <Show when={showDetail() && selectedPack()}>
            <DetailPane
              title={selectedPack()!.name}
              subtitle={`v${selectedPack()!.version}`}
              icon="◎"
              fields={detailFields()}
              actions={
                selectedPack()!.installed
                  ? [
                      { key: 's', label: 'Sync' },
                      { key: 'u', label: 'Uninstall' },
                      { key: 'Esc', label: 'Close' },
                    ]
                  : [
                      { key: 'i', label: 'Install' },
                      { key: 'Esc', label: 'Close' },
                    ]
              }
              width={35}
              visible={showDetail()}
              onClose={() => setShowDetail(false)}
            />
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter details  i install  u uninstall  s sync  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

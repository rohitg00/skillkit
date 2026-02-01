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
  loadPluginsList,
  enablePlugin,
  disablePlugin,
  getPluginInfo,
  type PluginServiceState,
  type PluginListItem,
} from '../services/plugin.service.js';
import type { PluginManager, Plugin } from '@skillkit/core';

interface PluginsProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Plugins(props: PluginsProps) {
  const [state, setState] = createSignal<PluginServiceState>({
    plugins: [],
    manager: null,
    loading: true,
    error: null,
  });
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);
  const [selectedPlugin, setSelectedPlugin] = createSignal<Plugin | null>(null);
  const [toggling, setToggling] = createSignal(false);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await loadPluginsList();
    setState(result);
  };

  const handleToggle = async () => {
    const plugins = state().plugins;
    const manager = state().manager;
    if (plugins.length === 0 || !manager) return;

    const plugin = plugins[selectedIndex()];
    if (!plugin) return;

    setToggling(true);

    if (plugin.enabled) {
      await disablePlugin(plugin.name, manager);
    } else {
      await enablePlugin(plugin.name, manager);
    }

    await loadData();
    setToggling(false);
  };

  const handleShowDetail = async () => {
    const plugins = state().plugins;
    const manager = state().manager;
    if (plugins.length === 0 || !manager) return;

    const plugin = plugins[selectedIndex()];
    if (!plugin) return;

    const info = await getPluginInfo(plugin.name, manager);
    setSelectedPlugin(info as Plugin | null);
    setShowDetail(true);
  };

  const handleKeyNav = (delta: number) => {
    const max = state().plugins.length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleShowDetail();
    else if (key.name === 'space' || key.name === 't') handleToggle();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (showDetail()) setShowDetail(false);
      else props.onNavigate('home');
    }
  });

  const getTypeIcon = (type: PluginListItem['type']): string => {
    switch (type) {
      case 'translator':
        return '⇄';
      case 'provider':
        return '◆';
      case 'command':
        return '⌘';
      default:
        return '◈';
    }
  };

  const currentPlugin = () => {
    const plugins = state().plugins;
    if (plugins.length === 0) return null;
    return plugins[selectedIndex()];
  };

  const detailFields = () => {
    const plugin = selectedPlugin();
    if (!plugin) return [];

    const current = currentPlugin();
    return [
      { label: 'Name', value: plugin.metadata.name },
      { label: 'Version', value: plugin.metadata.version },
      { label: 'Description', value: plugin.metadata.description || 'No description' },
      { label: 'Type', value: current?.type || 'unknown' },
      { label: 'Status', value: current?.enabled ? 'Enabled' : 'Disabled' },
      { label: 'Path', value: current?.path || 'N/A' },
    ];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Plugins"
        subtitle="Extend SkillKit with plugins"
        count={state().plugins.length}
        icon="◈"
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading}>
        <Spinner label="Loading plugins..." />
      </Show>

      <Show when={!state().loading && !state().error}>
        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <Show
              when={state().plugins.length > 0}
              fallback={
                <EmptyState
                  icon="◈"
                  title="No plugins installed"
                  description="Install plugins from ~/.skillkit/plugins/"
                />
              }
            >
              <text fg={terminalColors.text}>
                <b>Installed Plugins</b>
              </text>
              <text> </text>

              <For each={state().plugins}>
                {(plugin, idx) => {
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
                        fg={selected() ? terminalColors.accent : terminalColors.textSecondary}
                        width={3}
                      >
                        {getTypeIcon(plugin.type)}{' '}
                      </text>
                      <text
                        fg={selected() ? terminalColors.accent : terminalColors.text}
                        width={20}
                      >
                        {plugin.name}
                      </text>
                      <text fg={terminalColors.textMuted} width={10}>
                        v{plugin.version}
                      </text>
                      <text
                        fg={
                          plugin.enabled
                            ? terminalColors.success
                            : terminalColors.textMuted
                        }
                      >
                        {plugin.enabled ? '● enabled' : '○ disabled'}
                      </text>
                    </box>
                  );
                }}
              </For>
            </Show>

            <Show when={toggling()}>
              <text> </text>
              <StatusIndicator status="loading" label="Toggling plugin..." />
            </Show>

            <Show when={currentPlugin() && !toggling()}>
              <text> </text>
              <text fg={terminalColors.textMuted}>─────────────────────────────</text>
              <text> </text>
              <text fg={terminalColors.textMuted}>
                {currentPlugin()!.description || 'No description available'}
              </text>
            </Show>
          </box>

          <Show when={showDetail() && selectedPlugin()}>
            <DetailPane
              title={selectedPlugin()!.metadata.name}
              subtitle={`v${selectedPlugin()!.metadata.version}`}
              icon={getTypeIcon(currentPlugin()?.type || 'mixed')}
              fields={detailFields()}
              actions={[
                {
                  key: 't',
                  label: currentPlugin()?.enabled ? 'Disable' : 'Enable',
                },
                { key: 'Esc', label: 'Close' },
              ]}
              width={35}
              visible={showDetail()}
              onClose={() => setShowDetail(false)}
            />
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter details  Space toggle  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';

interface PluginInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  translators?: string[];
  providers?: string[];
  commands?: string[];
}

interface Props {
  cols?: number;
  rows?: number;
}

export function Plugins({ rows = 24 }: Props) {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const maxVisible = Math.max(5, rows - 12);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), plugins.length - maxVisible));
  const visible = plugins.slice(start, start + maxVisible);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    setError(null);

    try {
      const { createPluginManager } = await import('@skillkit/core');
      const manager = createPluginManager(process.cwd());
      const allPlugins = manager.listPlugins();

      const pluginInfos: PluginInfo[] = allPlugins.map(p => {
        const plugin = manager.getPlugin(p.name);
        return {
          name: p.name,
          version: p.version,
          description: p.description,
          author: p.author,
          enabled: manager.isPluginEnabled(p.name),
          translators: plugin?.translators?.map(t => t.agentType as string),
          providers: plugin?.providers?.map(pr => pr.providerName),
          commands: plugin?.commands?.map(c => c.name),
        };
      });

      setPlugins(pluginInfos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load plugins');
    }

    setLoading(false);
  };

  const togglePlugin = async (pluginName: string, currentEnabled: boolean) => {
    setLoading(true);
    setMessage(null);

    try {
      const { createPluginManager } = await import('@skillkit/core');
      const manager = createPluginManager(process.cwd());

      if (currentEnabled) {
        manager.disablePlugin(pluginName);
        setMessage(`Disabled: ${pluginName}`);
      } else {
        manager.enablePlugin(pluginName);
        setMessage(`Enabled: ${pluginName}`);
      }

      // Reload
      await loadPlugins();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Toggle failed');
      setLoading(false);
    }
  };

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(plugins.length - 1, i + 1));
    else if (input === 'r') loadPlugins();
    else if (input === 'e' && plugins[sel]) {
      togglePlugin(plugins[sel].name, plugins[sel].enabled);
    }
    else if (key.return && plugins[sel]) {
      togglePlugin(plugins[sel].name, plugins[sel].enabled);
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={colors.primary} bold>Plugin Manager</Text>
        <Box marginTop={1}>
          <Text color={colors.secondaryDim}>{symbols.spinner[0]} Loading...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color={colors.primary} bold>Plugin Manager</Text>
      <Text color={colors.secondaryDim} dimColor>Manage SkillKit extensions</Text>

      {error && (
        <Box marginTop={1}>
          <Text color="red">{symbols.error} {error}</Text>
        </Box>
      )}

      {message && (
        <Box marginTop={1}>
          <Text color="green">{symbols.success} {message}</Text>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.secondaryDim} bold>
          Installed Plugins ({plugins.length})
        </Text>

        {plugins.length === 0 ? (
          <Box marginTop={1} flexDirection="column">
            <Text color={colors.secondaryDim} dimColor>No plugins installed.</Text>
            <Text color={colors.secondaryDim} dimColor>
              Use: skillkit plugin install --source &lt;path-or-package&gt;
            </Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {visible.map((plugin, i) => {
              const actualIndex = start + i;
              const isSelected = actualIndex === sel;
              const statusColor = plugin.enabled ? 'green' : 'gray';
              const statusText = plugin.enabled ? 'enabled' : 'disabled';

              return (
                <Box key={plugin.name} flexDirection="column">
                  <Text>
                    {isSelected ? symbols.pointer : ' '}{' '}
                    <Text color={isSelected ? colors.primary : colors.secondaryDim} bold={isSelected}>
                      {plugin.name}
                    </Text>
                    <Text dimColor> v{plugin.version}</Text>
                    <Text color={statusColor}> [{statusText}]</Text>
                  </Text>
                  {isSelected && (
                    <Box flexDirection="column" marginLeft={3}>
                      {plugin.description && (
                        <Text color={colors.secondaryDim} dimColor>{plugin.description}</Text>
                      )}
                      {plugin.author && (
                        <Text dimColor>Author: {plugin.author}</Text>
                      )}
                      {plugin.translators && plugin.translators.length > 0 && (
                        <Text dimColor>Translators: {plugin.translators.join(', ')}</Text>
                      )}
                      {plugin.providers && plugin.providers.length > 0 && (
                        <Text dimColor>Providers: {plugin.providers.join(', ')}</Text>
                      )}
                      {plugin.commands && plugin.commands.length > 0 && (
                        <Text dimColor>Commands: {plugin.commands.join(', ')}</Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box marginTop={1} borderStyle="single" borderColor={colors.borderDim} paddingX={1}>
        <Text dimColor>
          [↑↓] Navigate  [e/Enter] Toggle Enable/Disable  [r] Refresh
        </Text>
      </Box>
    </Box>
  );
}

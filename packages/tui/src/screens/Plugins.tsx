/**
 * Plugins Screen
 * Plugin management
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface PluginsProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Plugins({ onNavigate, cols = 80, rows = 24 }: PluginsProps) {
  const plugins = [
    { name: 'git-hooks', enabled: true, version: '1.2.0' },
    { name: 'ai-suggest', enabled: true, version: '0.9.1' },
    { name: 'metrics', enabled: false, version: '2.0.0' },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Plugins"
        subtitle="Extend SkillKit with plugins"
        count={plugins.length}
        icon="&#x25C8;"
      />

      <text fg={terminalColors.text}><b>Installed Plugins</b></text>
      <text> </text>

      {plugins.map((plugin, idx) => (
        <box key={plugin.name} flexDirection="row" marginBottom={1}>
          <text
            fg={idx === 0 ? terminalColors.accent : terminalColors.text}
            width={18}
          >
            {idx === 0 ? '\u25B8 ' : '  '}{plugin.name}
          </text>
          <text fg={terminalColors.textMuted} width={10}>v{plugin.version}</text>
          <text
            fg={plugin.enabled ? terminalColors.success : terminalColors.textMuted}
          >
            {plugin.enabled ? '\u25CF enabled' : '\u25CB disabled'}
          </text>
        </box>
      ))}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press Enter to toggle, 'a' to add new, 'u' to update
      </text>
    </box>
  );
}

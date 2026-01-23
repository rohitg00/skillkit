import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { colors, symbols } from '../theme.js';
import { loadConfig, saveConfig, AgentType as AgentTypeSchema, type SkillkitConfig, type AgentType } from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

interface Setting {
  id: keyof SkillkitConfig | 'agent' | 'autoSync' | 'cacheDir';
  label: string;
  type: 'select' | 'toggle' | 'text';
  options?: string[];
}

// Get all valid agent types from the Zod schema
const ALL_AGENTS: AgentType[] = AgentTypeSchema.options;

const SETTINGS: Setting[] = [
  { id: 'agent', label: 'Default Agent', type: 'select', options: ['auto-detect', ...ALL_AGENTS] },
  { id: 'autoSync', label: 'Auto Sync', type: 'toggle' },
  { id: 'cacheDir', label: 'Cache Dir', type: 'text' },
];

export function Settings(_props: Props) {
  const [config, setConfig] = useState<SkillkitConfig | null>(null);
  const [sel, setSel] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    try {
      const loaded = loadConfig();
      setConfig(loaded);
    } catch (err) {
      setError(`Failed to load config: ${err}`);
    }
  }, []);

  const getCurrentValue = (setting: Setting): string => {
    if (!config) return '';

    switch (setting.id) {
      case 'agent':
        return config.agent || 'auto-detect';
      case 'autoSync':
        return config.autoSync ? 'enabled' : 'disabled';
      case 'cacheDir':
        return config.cacheDir || '~/.skillkit/cache';
      default:
        return '';
    }
  };

  const handleSave = (setting: Setting, value: string) => {
    if (!config) return;

    const newConfig = { ...config };

    switch (setting.id) {
      case 'agent':
        if (value === 'auto-detect') {
          newConfig.agent = 'universal';
        } else {
          newConfig.agent = value as AgentType;
        }
        break;
      case 'autoSync':
        newConfig.autoSync = value === 'enabled';
        break;
      case 'cacheDir':
        newConfig.cacheDir = value || undefined;
        break;
    }

    try {
      saveConfig(newConfig, false);
      setConfig(newConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(`Failed to save: ${err}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  useInput((input, key) => {
    if (editing) {
      if (key.return) {
        handleSave(SETTINGS[sel], editValue);
        setEditing(false);
      } else if (key.escape) {
        setEditing(false);
      }
      return;
    }

    if (key.upArrow) {
      setSel(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSel(i => Math.min(SETTINGS.length - 1, i + 1));
    } else if (key.return || input === ' ') {
      const setting = SETTINGS[sel];

      if (setting.type === 'toggle') {
        const current = getCurrentValue(setting);
        const newValue = current === 'enabled' ? 'disabled' : 'enabled';
        handleSave(setting, newValue);
      } else if (setting.type === 'select' && setting.options) {
        const current = getCurrentValue(setting);
        const idx = setting.options.indexOf(current);
        const nextIdx = (idx + 1) % setting.options.length;
        handleSave(setting, setting.options[nextIdx]);
      } else if (setting.type === 'text') {
        setEditValue(getCurrentValue(setting));
        setEditing(true);
      }
    }
  });

  if (!config) {
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>SETTINGS</Text>
        {error ? (
          <Text color={colors.danger}>{symbols.error} {error}</Text>
        ) : (
          <Text dimColor>Loading...</Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>SETTINGS</Text>
      <Text dimColor>Configure SkillKit (changes save automatically)</Text>

      <Box marginTop={1} flexDirection="column">
        {SETTINGS.map((s, i) => {
          const isSel = i === sel;
          const value = getCurrentValue(s);
          const isEditing = editing && isSel;

          return (
            <Box key={s.id}>
              <Text inverse={isSel && !isEditing}>
                {isSel ? symbols.pointer : ' '}{s.label.padEnd(16)}
              </Text>
              {isEditing ? (
                <Box marginLeft={1}>
                  <TextInput
                    value={editValue}
                    onChange={setEditValue}
                    onSubmit={() => {
                      handleSave(s, editValue);
                      setEditing(false);
                    }}
                  />
                </Box>
              ) : (
                <Text color={colors.secondaryDim}> {value}</Text>
              )}
              {s.type === 'toggle' && isSel && !isEditing && (
                <Text dimColor> (space to toggle)</Text>
              )}
              {s.type === 'select' && isSel && !isEditing && (
                <Text dimColor> (enter to cycle)</Text>
              )}
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        {saved && <Text color={colors.success}>{symbols.check} Settings saved</Text>}
        {error && <Text color={colors.danger}>{symbols.error} {error}</Text>}
        {!saved && !error && (
          <Text dimColor>
            {editing ? 'Enter=save  Esc=cancel' : 'Enter/Space=edit  q=quit'}
          </Text>
        )}
      </Box>
    </Box>
  );
}

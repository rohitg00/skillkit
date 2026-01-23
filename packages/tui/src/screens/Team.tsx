import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';

interface SharedSkill {
  name: string;
  version: string;
  description?: string;
  author: string;
  downloads?: number;
  tags?: string[];
}

interface TeamConfig {
  teamId: string;
  teamName: string;
  registryUrl: string;
}

interface Props {
  cols?: number;
  rows?: number;
}

export function Team({ rows = 24 }: Props) {
  const [config, setConfig] = useState<TeamConfig | null>(null);
  const [skills, setSkills] = useState<SharedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const maxVisible = Math.max(5, rows - 12);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), skills.length - maxVisible));
  const visible = skills.slice(start, start + maxVisible);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    setError(null);

    try {
      const { createTeamManager } = await import('@skillkit/core');
      const manager = createTeamManager(process.cwd());
      const teamConfig = manager.load();

      if (!teamConfig) {
        setConfig(null);
        setSkills([]);
        setError('Team not initialized. Run `skillkit team init` first.');
      } else {
        setConfig(teamConfig);
        const sharedSkills = manager.listSharedSkills();
        setSkills(sharedSkills);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    }

    setLoading(false);
  };

  const syncTeam = async () => {
    if (!config) return;
    setLoading(true);
    setMessage(null);

    try {
      const { createTeamManager } = await import('@skillkit/core');
      const manager = createTeamManager(process.cwd());
      const result = await manager.sync();

      const changes = [...result.added, ...result.updated];
      if (changes.length > 0) {
        setMessage(`Synced: ${changes.join(', ')}`);
      } else {
        setMessage('Already up to date');
      }

      // Reload skills
      const sharedSkills = manager.listSharedSkills();
      setSkills(sharedSkills);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    }

    setLoading(false);
  };

  const importSkill = async (skillName: string) => {
    if (!config) return;
    setLoading(true);
    setMessage(null);

    try {
      const { createTeamManager } = await import('@skillkit/core');
      const manager = createTeamManager(process.cwd());
      const result = await manager.importSkill(skillName, { overwrite: false });

      if (result.success) {
        setMessage(`Imported: ${skillName}`);
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    }

    setLoading(false);
  };

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(skills.length - 1, i + 1));
    else if (input === 'r') loadTeam();
    else if (input === 's') syncTeam();
    else if (key.return && skills[sel]) {
      importSkill(skills[sel].name);
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={colors.primary} bold>Team Collaboration</Text>
        <Box marginTop={1}>
          <Text color={colors.secondaryDim}>{symbols.spinner[0]} Loading...</Text>
        </Box>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={colors.primary} bold>Team Collaboration</Text>
        <Box marginTop={1} flexDirection="column">
          <Text color={colors.secondaryDim}>{symbols.warning} Team not initialized</Text>
          <Text color={colors.secondaryDim} dimColor>
            Run: skillkit team init --name "Team Name" --registry &lt;url&gt;
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[r] Refresh</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color={colors.primary} bold>Team: {config.teamName}</Text>
      <Text color={colors.secondaryDim} dimColor>Registry: {config.registryUrl}</Text>

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
          Shared Skills ({skills.length})
        </Text>

        {skills.length === 0 ? (
          <Text color={colors.secondaryDim} dimColor>
            No shared skills. Use `skillkit team share --name &lt;skill&gt;` to share.
          </Text>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {visible.map((skill, i) => {
              const actualIndex = start + i;
              const isSelected = actualIndex === sel;
              return (
                <Box key={skill.name} flexDirection="column">
                  <Text>
                    {isSelected ? symbols.pointer : ' '}{' '}
                    <Text color={isSelected ? colors.primary : colors.secondaryDim} bold={isSelected}>
                      {skill.name}
                    </Text>
                    <Text dimColor> v{skill.version}</Text>
                    <Text dimColor> by {skill.author}</Text>
                    {skill.downloads !== undefined && (
                      <Text dimColor> | {skill.downloads} downloads</Text>
                    )}
                  </Text>
                  {skill.description && isSelected && (
                    <Text color={colors.secondaryDim} dimColor>    {skill.description}</Text>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box marginTop={1} borderStyle="single" borderColor={colors.borderDim} paddingX={1}>
        <Text dimColor>
          [↑↓] Navigate  [Enter] Import  [s] Sync  [r] Refresh
        </Text>
      </Box>
    </Box>
  );
}

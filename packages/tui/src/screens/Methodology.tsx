import { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import {
  MethodologyManager,
  type MethodologyPack,
  type MethodologySkill,
} from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

type View = 'packs' | 'skills';

export function Methodology({ rows = 24 }: Props) {
  const [packs, setPacks] = useState<MethodologyPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<MethodologyPack | null>(null);
  const [skills, setSkills] = useState<MethodologySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('packs');
  const [sel, setSel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const manager = useMemo(() => new MethodologyManager({
    projectPath: process.cwd(),
  }), []);

  const maxVisible = Math.max(5, rows - 10);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedPacks = await manager.listAvailablePacks();
      setPacks(loadedPacks);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load methodology packs');
    }
    setLoading(false);
  };

  const loadSkills = async (pack: MethodologyPack) => {
    setLoading(true);
    setError(null);
    try {
      const loader = manager.getLoader();
      const loadedSkills = await loader.loadPackSkills(pack.name);
      setSkills(loadedSkills);
      setSelectedPack(pack);
      setView('skills');
      setSel(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load skills');
    }
    setLoading(false);
  };

  const installPack = async (pack: MethodologyPack) => {
    setLoading(true);
    setMessage(null);
    try {
      await manager.installPack(pack.name);
      setMessage(`Installed ${pack.name} methodology pack`);
      // Refresh packs list after install
      await loadPacks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to install pack');
    }
    setLoading(false);
  };

  const items = view === 'packs' ? packs : skills;
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), items.length - maxVisible));
  const visible = items.slice(start, start + maxVisible);

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(items.length - 1, i + 1));
    else if (input === 'r') {
      if (view === 'packs') loadPacks();
      else if (selectedPack) loadSkills(selectedPack);
    }
    else if (key.escape || input === 'b') {
      if (view === 'skills') {
        setView('packs');
        setSel(0);
        setSelectedPack(null);
      }
    }
    else if (key.return) {
      if (view === 'packs' && packs[sel]) {
        loadSkills(packs[sel]);
      }
    }
    else if (input === 'i' && view === 'packs' && packs[sel]) {
      installPack(packs[sel]);
    }
  });

  const renderPackItem = (pack: MethodologyPack, idx: number) => {
    const isSel = idx === sel;
    return (
      <Box key={pack.name} flexDirection="column">
        <Text inverse={isSel}>
          {isSel ? symbols.pointer : ' '} {pack.name} <Text dimColor>v{pack.version}</Text>
        </Text>
        {isSel && (
          <>
            <Text dimColor>   {pack.description}</Text>
            <Text dimColor>   {pack.skills.length} skill(s) | Tags: {pack.tags?.join(', ') || 'none'}</Text>
          </>
        )}
      </Box>
    );
  };

  const renderSkillItem = (skill: MethodologySkill, idx: number) => {
    const isSel = idx === sel;
    return (
      <Box key={skill.name} flexDirection="column">
        <Text inverse={isSel}>
          {isSel ? symbols.pointer : ' '} {skill.name}
        </Text>
        {isSel && skill.description && (
          <Text dimColor>   {skill.description}</Text>
        )}
        {isSel && skill.tags && (
          <Text dimColor>   Tags: {skill.tags.join(', ')}</Text>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>
        {view === 'packs' ? 'METHODOLOGY PACKS' : `${selectedPack?.name.toUpperCase()} SKILLS`}
      </Text>
      <Text dimColor>
        {view === 'packs'
          ? `${packs.length} pack(s) available`
          : `${skills.length} skill(s) in pack`}
      </Text>

      {loading && <Text color="yellow">Loading...</Text>}
      {error && <Text color="red">{symbols.error} {error}</Text>}
      {message && <Text color="green">{symbols.success} {message}</Text>}

      {!loading && items.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No {view === 'packs' ? 'methodology packs' : 'skills'} found.</Text>
        </Box>
      )}

      {!loading && items.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  {symbols.arrowUp} {start} more</Text>}
          {view === 'packs'
            ? (visible as MethodologyPack[]).map((pack, i) => renderPackItem(pack, start + i))
            : (visible as MethodologySkill[]).map((skill, i) => renderSkillItem(skill, start + i))
          }
          {start + maxVisible < items.length && (
            <Text dimColor>  {symbols.arrowDown} {items.length - start - maxVisible} more</Text>
          )}
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        {view === 'packs' ? (
          <Text dimColor>Enter=view skills  i=install  r=refresh  q=quit</Text>
        ) : (
          <Text dimColor>b/Esc=back  r=refresh  q=quit</Text>
        )}
      </Box>
    </Box>
  );
}

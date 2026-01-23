import { useState, useEffect } from 'react';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import {
  translateSkill,
  getSupportedTranslationAgents,
  type AgentType,
} from '@skillkit/core';
import { getAllAdapters, getAdapter } from '@skillkit/agents';
import { getInstallDir } from '../helpers.js';

type View = 'skills' | 'agents' | 'preview' | 'result';

interface InstalledSkill {
  name: string;
  path: string;
  content: string;
}

interface Props {
  cols?: number;
  rows?: number;
}

export function Translate({ rows = 24 }: Props) {
  const [view, setView] = useState<View>('skills');
  const [skills, setSkills] = useState<InstalledSkill[]>([]);
  const [agents, setAgents] = useState<{ type: AgentType; name: string }[]>([]);
  const [sel, setSel] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<InstalledSkill | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<{ type: AgentType; name: string } | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<{ success: boolean; message: string; path?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSkills = () => {
      const installDir = getInstallDir(false);
      const foundSkills: InstalledSkill[] = [];

      if (existsSync(installDir)) {
        const dirs = readdirSync(installDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const dir of dirs) {
          const skillPath = join(installDir, dir);
          const skillMdPath = join(skillPath, 'SKILL.md');

          if (existsSync(skillMdPath)) {
            const content = readFileSync(skillMdPath, 'utf-8');
            foundSkills.push({
              name: dir,
              path: skillPath,
              content,
            });
          }
        }
      }

      setSkills(foundSkills);
    };

    loadSkills();
  }, []);

  useEffect(() => {
    const adapters = getAllAdapters();
    const supportedAgents = getSupportedTranslationAgents();
    const agentList = adapters
      .filter(a => supportedAgents.includes(a.type as AgentType))
      .map(a => ({
        type: a.type as AgentType,
        name: a.name,
      }));
    setAgents(agentList);
  }, []);

  const currentItems = view === 'skills' ? skills : agents;
  const maxVisible = Math.max(5, rows - 12);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), currentItems.length - maxVisible));
  const visible = currentItems.slice(start, start + maxVisible);

  const generatePreview = (skill: InstalledSkill, agent: { type: AgentType; name: string }) => {
    try {
      const result = translateSkill(skill.content, agent.type, { sourceFilename: 'SKILL.md' });
      return result.content;
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : 'Translation failed'}`;
    }
  };

  const executeTranslation = () => {
    if (!selectedSkill || !selectedAgent) return;

    setLoading(true);
    try {
      const translationResult = translateSkill(selectedSkill.content, selectedAgent.type, {
        sourceFilename: 'SKILL.md',
      });

      if (!translationResult.success) {
        setResult({
          success: false,
          message: `Translation failed: ${translationResult.warnings.join(', ')}`,
        });
        setLoading(false);
        return;
      }

      const adapter = getAdapter(selectedAgent.type);
      const targetDir = adapter?.skillsDir
        ? join(process.cwd(), adapter.skillsDir)
        : join(process.cwd(), `.${selectedAgent.type}/skills/`);

      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      const filename = translationResult.filename || `${selectedSkill.name}.md`;
      const targetPath = join(targetDir, filename);

      writeFileSync(targetPath, translationResult.content, 'utf-8');

      setResult({
        success: true,
        message: `Translated ${selectedSkill.name} to ${selectedAgent.name} format`,
        path: targetPath,
      });
    } catch (err) {
      setResult({
        success: false,
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
      setView('result');
    }
  };

  useInput((_input, key) => {
    if (loading) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(currentItems.length - 1, i + 1));
    else if (key.escape) {
      if (view === 'result') {
        setView('skills');
        setSelectedSkill(null);
        setSelectedAgent(null);
        setResult(null);
        setSel(0);
      } else if (view === 'preview') {
        setView('agents');
      } else if (view === 'agents') {
        setView('skills');
        setSelectedSkill(null);
      }
    }
    else if (key.return) {
      if (view === 'skills' && skills[sel]) {
        setSelectedSkill(skills[sel]);
        setView('agents');
        setSel(0);
      } else if (view === 'agents' && agents[sel]) {
        setSelectedAgent(agents[sel]);
        const previewContent = generatePreview(selectedSkill!, agents[sel]);
        setPreview(previewContent);
        setView('preview');
      } else if (view === 'preview') {
        executeTranslation();
      } else if (view === 'result') {
        setView('skills');
        setSelectedSkill(null);
        setSelectedAgent(null);
        setResult(null);
        setSel(0);
      }
    }
  });

  if (view === 'result' && result) {
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>TRANSLATION {result.success ? 'COMPLETE' : 'FAILED'}</Text>

        <Box marginTop={1} flexDirection="column">
          <Text color={result.success ? 'green' : 'red'}>
            {result.success ? '✓' : '✗'} {result.message}
          </Text>
          {result.path && (
            <Text dimColor>Saved to: {result.path}</Text>
          )}
        </Box>

        <Box marginTop={2}>
          <Text dimColor>Press Enter or Esc to continue</Text>
        </Box>
      </Box>
    );
  }

  if (view === 'preview') {
    const previewLines = preview.split('\n').slice(0, maxVisible);
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>TRANSLATION PREVIEW</Text>
        <Text dimColor>
          {selectedSkill?.name} → {selectedAgent?.name}
        </Text>

        <Box marginTop={1} flexDirection="column" borderStyle="single" paddingX={1}>
          {previewLines.map((line, i) => (
            <Text key={i} dimColor>{line.slice(0, 70)}</Text>
          ))}
          {preview.split('\n').length > maxVisible && (
            <Text dimColor>... ({preview.split('\n').length - maxVisible} more lines)</Text>
          )}
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Enter=confirm translation  Esc=back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>
        {view === 'skills' ? 'TRANSLATE SKILL' : 'SELECT TARGET AGENT'}
      </Text>

      {view === 'skills' && (
        <Text dimColor>Select a skill to translate to another agent format</Text>
      )}

      {view === 'agents' && selectedSkill && (
        <Text dimColor>Translate "{selectedSkill.name}" to which agent format?</Text>
      )}

      {skills.length === 0 && view === 'skills' && (
        <Box marginTop={1}>
          <Text color="yellow">No skills installed. Install some skills first with 'skillkit install'</Text>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
        {visible.map((item, i) => {
          const idx = start + i;
          const isSel = idx === sel;

          if (view === 'skills') {
            const skill = item as InstalledSkill;
            return (
              <Text key={skill.name} inverse={isSel}>
                {isSel ? symbols.pointer : ' '} {skill.name}
              </Text>
            );
          } else {
            const agent = item as { type: AgentType; name: string };
            return (
              <Text key={agent.type} inverse={isSel}>
                {isSel ? symbols.pointer : ' '} {agent.name.padEnd(20)} <Text dimColor>({agent.type})</Text>
              </Text>
            );
          }
        })}
        {start + maxVisible < currentItems.length && (
          <Text dimColor>  ↓ {currentItems.length - start - maxVisible} more</Text>
        )}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          {view === 'skills'
            ? 'Enter=select skill  q=quit'
            : 'Enter=select agent  Esc=back  q=quit'}
        </Text>
      </Box>
    </Box>
  );
}

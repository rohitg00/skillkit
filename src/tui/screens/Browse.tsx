import React, { useState } from 'react';
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { useMarketplace } from '../hooks/useMarketplace.js';
import { detectProvider } from '../../providers/index.js';
import { detectAgent, getAdapter, getAllAdapters } from '../../agents/index.js';
import { getInstallDir, saveSkillMetadata } from '../../core/config.js';
import type { SkillMetadata, AgentType } from '../../core/types.js';

type View = 'repos' | 'skills' | 'agents';

interface Props {
  cols?: number;
  rows?: number;
}

export function Browse({ rows = 24 }: Props) {
  const { repos, skills, loading, currentRepo, fetchRepo, fetchAllRepos } = useMarketplace();
  const [view, setView] = useState<View>('repos');
  const [sel, setSel] = useState(0);
  const [installing, setInstalling] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; source: string } | null>(null);
  const [agents, setAgents] = useState<{ type: AgentType; name: string; detected: boolean }[]>([]);

  const items = view === 'repos' ? repos : view === 'skills' ? skills : agents;
  const maxVisible = Math.max(5, rows - 8);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), items.length - maxVisible));
  const visible = items.slice(start, start + maxVisible);

  const showAgentSelection = async (skillName: string, source: string) => {
    setSelectedSkill({ name: skillName, source });
    const adapters = getAllAdapters();
    const agentList: typeof agents = [];
    for (const a of adapters) {
      agentList.push({
        type: a.type as AgentType,
        name: a.name,
        detected: await a.isDetected(),
      });
    }
    setAgents(agentList);
    setView('agents');
    setSel(0);
  };

  const installSkill = async (skillName: string, source: string, agentType?: AgentType) => {
    setInstalling(skillName);
    setMessage(null);
    
    try {
      const provider = detectProvider(source);
      if (!provider) {
        setMessage(`Error: Unknown provider for ${source}`);
        setInstalling(null);
        return;
      }

      const result = await provider.clone(source, '', { depth: 1 });
      
      if (!result.success || !result.discoveredSkills) {
        setMessage(`Error: ${result.error || 'Failed to fetch'}`);
        setInstalling(null);
        return;
      }

      const skill = result.discoveredSkills.find(s => s.name === skillName);
      if (!skill) {
        setMessage(`Error: Skill ${skillName} not found`);
        setInstalling(null);
        return;
      }

      const targetAgentType = agentType || await detectAgent();
      const adapter = getAdapter(targetAgentType);
      const installDir = getInstallDir(false, targetAgentType);
      
      if (!existsSync(installDir)) {
        mkdirSync(installDir, { recursive: true });
      }

      const targetPath = join(installDir, skillName);
      
      if (existsSync(targetPath)) {
        rmSync(targetPath, { recursive: true, force: true });
      }
      
      cpSync(skill.path, targetPath, { recursive: true, dereference: true });

      const metadata: SkillMetadata = {
        name: skillName,
        description: skill.description || '',
        source: source,
        sourceType: provider.type,
        subpath: skillName,
        installedAt: new Date().toISOString(),
        enabled: true,
      };
      saveSkillMetadata(targetPath, metadata);

      if (result.tempRoot) {
        rmSync(result.tempRoot, { recursive: true, force: true });
      }

      setMessage(`✓ Installed ${skillName} to ${adapter.name}`);
      if (!agentType) {
        setView('skills');
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setInstalling(null);
      if (agentType) {
        setSelectedSkill(null);
      }
    }
  };

  useInput((input, key) => {
    if (loading || installing) return;
    
    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(items.length - 1, i + 1));
    else if (key.return) {
      if (view === 'repos' && repos[sel]) {
        fetchRepo(repos[sel].source);
        setView('skills');
        setSel(0);
        setMessage(null);
      } else if (view === 'skills' && skills[sel]?.source) {
        installSkill(skills[sel].name, skills[sel].source);
      } else if (view === 'agents' && agents[sel]) {
        installSkill(selectedSkill!.name, selectedSkill!.source, agents[sel].type);
      }
    }
    else if (input === 'm' && view === 'skills' && skills[sel]?.source) {
      showAgentSelection(skills[sel].name, skills[sel].source!);
    }
    else if (input === 'r') {
      if (view === 'skills') {
        setView('repos');
        setSel(0);
        setMessage(null);
      } else if (view === 'agents') {
        setView('skills');
        setSel(0);
      }
    }
    else if (input === 'a' && view === 'repos') { 
      fetchAllRepos(); 
      setView('skills'); 
      setSel(0); 
    }
  });

  if (view === 'agents') {
    return (
      <Box flexDirection="column">
        <Text bold>{colors.primary('SELECT AGENT')}</Text>
        <Text dimColor>Install "{selectedSkill?.name}" to which agent?</Text>
        <Text dimColor>(All agents supported - directory created if needed)</Text>
        
        <Box marginTop={1} flexDirection="column">
          {visible.map((agent, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            const a = agent as typeof agents[0];
            const status = a.detected ? '(ready)' : '(will create)';
            return (
              <Text key={a.type} inverse={isSel}>
                {isSel ? symbols.pointer : ' '} {a.name.padEnd(20)} {colors.secondaryDim(status)}
              </Text>
            );
          })}
        </Box>
        
        <Box marginTop={1}>
          <Text dimColor>Enter=install to selected agent  r=back  q=quit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>{colors.primary(view === 'repos' ? 'REPOSITORIES' : 'SKILLS')}</Text>
      {loading && <Text dimColor>Loading {currentRepo}...</Text>}
      {installing && <Text>Installing {installing}...</Text>}
      {message && <Text dimColor>{message}</Text>}
      <Text dimColor>{items.length} items</Text>

      <Box marginTop={1} flexDirection="column">
        {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
        {visible.map((item, i) => {
          const idx = start + i;
          const isSel = idx === sel;
          const name = view === 'repos' 
            ? (item as typeof repos[0]).name
            : (item as typeof skills[0]).name;
          const src = view === 'repos'
            ? (item as typeof repos[0]).source
            : (item as typeof skills[0]).source || '';
          return (
            <Text key={src + name} inverse={isSel}>
              {isSel ? symbols.pointer : ' '}{name.padEnd(25)} {colors.secondaryDim(src)}
            </Text>
          );
        })}
        {start + maxVisible < items.length && <Text dimColor>  ↓ {items.length - start - maxVisible} more</Text>}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          {view === 'repos' 
            ? 'Enter=fetch  a=all  q=quit' 
            : 'Enter=quick install  m=choose agent  r=back  q=quit'}
        </Text>
      </Box>
    </Box>
  );
}

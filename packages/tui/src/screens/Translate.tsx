import { createSignal, createEffect, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen, loadSkillsWithDetails, type SkillWithDetails } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { AGENT_LOGOS } from '../theme/symbols.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  getSupportedAgents,
  checkCanTranslate,
  translate,
  previewTranslation,
  getAgentFormatInfo,
} from '../services/translator.service.js';
import type { AgentType } from '@skillkit/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface TranslateProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

type FocusedPane = 'source' | 'target' | 'skills';

function readSkillContent(skillPath: string): string | undefined {
  const skillMdPath = join(skillPath, 'SKILL.md');
  if (existsSync(skillMdPath)) {
    return readFileSync(skillMdPath, 'utf-8');
  }
  return undefined;
}

export function Translate(props: TranslateProps) {
  const [supportedAgents, setSupportedAgents] = createSignal<AgentType[]>([]);
  const [skills, setSkills] = createSignal<SkillWithDetails[]>([]);
  const [sourceAgentIndex, setSourceAgentIndex] = createSignal(0);
  const [targetAgentIndex, setTargetAgentIndex] = createSignal(1);
  const [selectedSkillIndex, setSelectedSkillIndex] = createSignal(0);
  const [focusedPane, setFocusedPane] = createSignal<FocusedPane>('skills');
  const [translating, setTranslating] = createSignal(false);
  const [preview, setPreview] = createSignal<{
    preview: string;
    compatible: boolean;
    issues: string[];
  } | null>(null);
  const [result, setResult] = createSignal<{
    success: boolean;
    content: string;
    filename?: string;
  } | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const agents = getSupportedAgents();
      setSupportedAgents(agents);

      const skillsWithDetails = loadSkillsWithDetails();
      setSkills(skillsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }

    setLoading(false);
  };

  const sourceAgent = () => {
    const agents = supportedAgents();
    if (agents.length === 0) return null;
    return agents[sourceAgentIndex()];
  };

  const targetAgent = () => {
    const agents = supportedAgents();
    if (agents.length === 0) return null;
    return agents[targetAgentIndex()];
  };

  const selectedSkill = () => {
    const skillList = skills();
    if (skillList.length === 0) return null;
    return skillList[selectedSkillIndex()];
  };

  const canDoTranslation = () => {
    const source = sourceAgent();
    const target = targetAgent();
    if (!source || !target) return false;
    return checkCanTranslate(source, target);
  };

  const handlePreview = () => {
    const skill = selectedSkill();
    const target = targetAgent();
    if (!skill || !target || !skill.path) {
      setError('No skill path available for preview');
      return;
    }

    try {
      const content = readSkillContent(skill.path);
      if (!content) {
        setError('Could not read skill content');
        return;
      }

      const previewResult = previewTranslation(content, target);
      setPreview(previewResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    }
  };

  const handleTranslate = async () => {
    const skill = selectedSkill();
    const target = targetAgent();
    if (!skill || !target || !skill.path) {
      setError('No skill path available for translation');
      return;
    }

    const content = readSkillContent(skill.path);
    if (!content) {
      setError('Could not read skill content');
      return;
    }

    setTranslating(true);
    setResult(null);
    setError(null);

    try {
      const translationResult = translate(content, target);
      setResult({
        success: translationResult.success,
        content: translationResult.content,
        filename: translationResult.filename,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleKeyNav = (delta: number) => {
    if (focusedPane() === 'skills') {
      const max = skills().length - 1;
      setSelectedSkillIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    } else if (focusedPane() === 'source') {
      const max = supportedAgents().length - 1;
      setSourceAgentIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    } else {
      const max = supportedAgents().length - 1;
      setTargetAgentIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    }
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'tab') {
      setFocusedPane((p) => {
        if (p === 'skills') return 'source';
        if (p === 'source') return 'target';
        return 'skills';
      });
    } else if (key.name === 'p') handlePreview();
    else if (key.name === 'return' || key.name === 't') handleTranslate();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (result() || preview()) {
        setResult(null);
        setPreview(null);
      } else {
        props.onNavigate('home');
      }
    }
  });

  const visibleAgents = () => supportedAgents().slice(0, 6);

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Translate Skills"
        subtitle="Convert skills between agent formats"
        icon="⇄"
      />

      <Show when={error()}>
        <ErrorState
          message={error()!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={loading()}>
        <Spinner label="Loading agents and skills..." />
      </Show>

      <Show when={!loading() && !error()}>
        <box flexDirection="row" marginBottom={1}>
          <box flexDirection="column" width={25}>
            <text
              fg={
                focusedPane() === 'source'
                  ? terminalColors.accent
                  : terminalColors.textMuted
              }
            >
              Source Agent
            </text>
            <Show when={sourceAgent()}>
              <text fg={terminalColors.accent}>
                <b>
                  {AGENT_LOGOS[sourceAgent()!]?.icon || '◇'}{' '}
                  {AGENT_LOGOS[sourceAgent()!]?.name || sourceAgent()}
                </b>
              </text>
              <text fg={terminalColors.textMuted}>
                {getAgentFormatInfo(sourceAgent()!).formatName}
              </text>
            </Show>
          </box>

          <box flexDirection="column" width={5} justifyContent="center">
            <text fg={terminalColors.textMuted}> → </text>
          </box>

          <box flexDirection="column" width={25}>
            <text
              fg={
                focusedPane() === 'target'
                  ? terminalColors.accent
                  : terminalColors.textMuted
              }
            >
              Target Agent
            </text>
            <Show when={targetAgent()}>
              <text fg={terminalColors.text}>
                <b>
                  {AGENT_LOGOS[targetAgent()!]?.icon || '◇'}{' '}
                  {AGENT_LOGOS[targetAgent()!]?.name || targetAgent()}
                </b>
              </text>
              <text fg={terminalColors.textMuted}>
                {getAgentFormatInfo(targetAgent()!).formatName}
              </text>
            </Show>
          </box>

          <Show when={!canDoTranslation()}>
            <text fg={terminalColors.warning}> ⚠ Incompatible</text>
          </Show>
        </box>

        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <box flexDirection="row">
          <box flexDirection="column" width={30}>
            <text
              fg={
                focusedPane() === 'skills'
                  ? terminalColors.accent
                  : terminalColors.text
              }
            >
              <b>Select Skill</b>
            </text>
            <text> </text>

            <Show
              when={skills().length > 0}
              fallback={
                <EmptyState
                  title="No skills installed"
                  description="Install skills first"
                  action={{ label: 'Browse', key: 'b' }}
                  compact
                />
              }
            >
              <For each={skills().slice(0, 6)}>
                {(skill, idx) => {
                  const selected = () =>
                    focusedPane() === 'skills' && idx() === selectedSkillIndex();
                  return (
                    <box marginBottom={1}>
                      <text
                        fg={selected() ? terminalColors.accent : terminalColors.text}
                      >
                        {selected() ? '▸ ' : '  '}
                        {skill.name}
                      </text>
                    </box>
                  );
                }}
              </For>
              <Show when={skills().length > 6}>
                <text fg={terminalColors.textMuted}>+{skills().length - 6} more</text>
              </Show>
            </Show>
          </box>

          <box width={2}>
            <text fg={terminalColors.border}>│</text>
          </box>

          <box flexDirection="column" width={35}>
            <Show when={focusedPane() !== 'skills'}>
              <text fg={terminalColors.text}>
                <b>{focusedPane() === 'source' ? 'Source' : 'Target'} Agents</b>
              </text>
              <text> </text>
              <For each={visibleAgents()}>
                {(agent, idx) => {
                  const isSource = focusedPane() === 'source';
                  const selectedIdx = isSource ? sourceAgentIndex() : targetAgentIndex();
                  const selected = () => idx() === selectedIdx;
                  return (
                    <box marginBottom={1}>
                      <text
                        fg={selected() ? terminalColors.accent : terminalColors.textSecondary}
                      >
                        {selected() ? '▸ ' : '  '}
                        {AGENT_LOGOS[agent]?.icon || '◇'} {AGENT_LOGOS[agent]?.name || agent}
                      </text>
                    </box>
                  );
                }}
              </For>
            </Show>

            <Show when={focusedPane() === 'skills' && selectedSkill()}>
              <text fg={terminalColors.text}>
                <b>Skill Info</b>
              </text>
              <text> </text>
              <text fg={terminalColors.textMuted}>Name: {selectedSkill()!.name}</text>
              <text fg={terminalColors.textMuted}>
                Path: {selectedSkill()!.path ? 'Available' : 'Unknown'}
              </text>
            </Show>
          </box>
        </box>

        <Show when={translating()}>
          <text> </text>
          <StatusIndicator status="loading" label="Translating skill..." />
        </Show>

        <Show when={preview() && !translating()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
          <text fg={terminalColors.text}>
            <b>Preview</b>
          </text>
          <text
            fg={
              preview()!.compatible ? terminalColors.success : terminalColors.warning
            }
          >
            {preview()!.compatible ? '✓ Compatible' : '⚠ Has issues'}
          </text>
          <Show when={preview()!.issues.length > 0}>
            <For each={preview()!.issues.slice(0, 2)}>
              {(issue) => <text fg={terminalColors.warning}>• {issue}</text>}
            </For>
          </Show>
        </Show>

        <Show when={result() && !translating()}>
          <text> </text>
          <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
          <text
            fg={result()!.success ? terminalColors.success : terminalColors.error}
          >
            {result()!.success ? '✓ Translation complete' : '✗ Translation failed'}
          </text>
          <Show when={result()!.filename}>
            <text fg={terminalColors.textMuted}>Output: {result()!.filename}</text>
          </Show>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          Tab switch pane  j/k navigate  p preview  Enter translate  Esc back
        </text>
      </Show>
    </box>
  );
}

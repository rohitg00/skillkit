import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { DetailPane } from '../components/DetailPane.js';
import { StatusIndicator } from '../components/StatusIndicator.js';
import {
  loadTeamConfig,
  initializeTeam,
  shareSkill,
  type TeamServiceState,
  type TeamMemberDisplay,
  type SharedSkillDisplay,
} from '../services/team.service.js';

interface TeamProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

type FocusedPane = 'members' | 'skills';

export function Team(props: TeamProps) {
  const [state, setState] = createSignal<TeamServiceState>({
    config: null,
    members: [],
    sharedSkills: [],
    loading: true,
    error: null,
  });
  const [focusedPane, setFocusedPane] = createSignal<FocusedPane>('members');
  const [selectedMemberIndex, setSelectedMemberIndex] = createSignal(0);
  const [selectedSkillIndex, setSelectedSkillIndex] = createSignal(0);
  const [showDetail, setShowDetail] = createSignal(false);
  const [initializing, setInitializing] = createSignal(false);

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await loadTeamConfig();
      setState(result);
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load team',
      }));
    }
  };

  const handleInitialize = async () => {
    if (initializing()) return;
    setInitializing(true);
    try {
      const success = await initializeTeam('My Team');
      if (success) {
        await loadData();
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to initialize team',
      }));
    } finally {
      setInitializing(false);
    }
  };

  const handleKeyNav = (delta: number) => {
    if (focusedPane() === 'members') {
      const max = state().members.length - 1;
      setSelectedMemberIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    } else {
      const max = state().sharedSkills.length - 1;
      setSelectedSkillIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
    }
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'tab' || key.name === 'l' || key.name === 'right') {
      setFocusedPane((p) => (p === 'members' ? 'skills' : 'members'));
    } else if (key.name === 'h' || key.name === 'left') {
      setFocusedPane((p) => (p === 'skills' ? 'members' : 'skills'));
    } else if (key.name === 'return') setShowDetail(true);
    else if (key.name === 'i') handleInitialize();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (showDetail()) setShowDetail(false);
      else props.onNavigate('home');
    }
  });

  const getStatusIcon = (status: TeamMemberDisplay['status']): string => {
    switch (status) {
      case 'active':
        return '●';
      case 'inactive':
        return '○';
      case 'pending':
        return '◐';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: TeamMemberDisplay['status']): string => {
    switch (status) {
      case 'active':
        return terminalColors.success;
      case 'inactive':
        return terminalColors.textMuted;
      case 'pending':
        return terminalColors.warning;
      default:
        return terminalColors.textMuted;
    }
  };

  const selectedMember = () => {
    const members = state().members;
    if (members.length === 0) return null;
    return members[selectedMemberIndex()];
  };

  const selectedSharedSkill = () => {
    const skills = state().sharedSkills;
    if (skills.length === 0) return null;
    return skills[selectedSkillIndex()];
  };

  const memberDetailFields = () => {
    const member = selectedMember();
    if (!member) return [];

    return [
      { label: 'Name', value: member.name },
      { label: 'Role', value: member.role },
      { label: 'Skills', value: String(member.skills) },
      { label: 'Status', value: member.status },
      { label: 'Last Sync', value: member.lastSync || 'Never' },
    ];
  };

  const skillDetailFields = () => {
    const skill = selectedSharedSkill();
    if (!skill) return [];

    return [
      { label: 'Name', value: skill.name },
      { label: 'Shared By', value: skill.sharedBy },
      { label: 'Shared At', value: skill.sharedAt },
      { label: 'Agents', value: skill.agents.join(', ') || 'All' },
    ];
  };

  const activeCount = createMemo(
    () => state().members.filter((m) => m.status === 'active').length
  );

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Team"
        subtitle="Collaborate with your development team"
        count={state().members.length}
        icon="◉"
      />

      <Show when={state().error}>
        <ErrorState
          message={state().error!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={state().loading}>
        <Spinner label="Loading team..." />
      </Show>

      <Show when={initializing()}>
        <StatusIndicator status="loading" label="Initializing team..." />
      </Show>

      <Show when={!state().loading && !state().error && !initializing()}>
        <Show
          when={state().config}
          fallback={
            <EmptyState
              icon="◉"
              title="No team configured"
              description="Initialize a team to start collaborating"
              action={{ label: 'Initialize', key: 'i' }}
            />
          }
        >
          <box flexDirection="row" marginBottom={1}>
            <text fg={terminalColors.textMuted}>Team: </text>
            <text fg={terminalColors.accent}>{state().config?.teamName || 'Unnamed'}</text>
            <text fg={terminalColors.textMuted}> • </text>
            <text fg={terminalColors.success}>{activeCount()} active</text>
            <text fg={terminalColors.textMuted}> • </text>
            <text fg={terminalColors.text}>{state().sharedSkills.length} shared skills</text>
          </box>

          <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
          <text> </text>

          <box flexDirection="row">
            <box flexDirection="column" width={30}>
              <text
                fg={
                  focusedPane() === 'members'
                    ? terminalColors.accent
                    : terminalColors.text
                }
              >
                <b>Members</b>
              </text>
              <text> </text>

              <Show
                when={state().members.length > 0}
                fallback={
                  <EmptyState title="No members" compact />
                }
              >
                <For each={state().members}>
                  {(member, idx) => {
                    const selected = () =>
                      focusedPane() === 'members' && idx() === selectedMemberIndex();
                    return (
                      <box flexDirection="row" marginBottom={1}>
                        <text
                          fg={selected() ? terminalColors.accent : terminalColors.text}
                          width={3}
                        >
                          {selected() ? '▸ ' : '  '}
                        </text>
                        <text
                          fg={selected() ? terminalColors.accent : terminalColors.text}
                          width={15}
                        >
                          {member.name}
                        </text>
                        <text fg={terminalColors.textMuted} width={8}>
                          {member.role}
                        </text>
                        <text fg={getStatusColor(member.status)}>
                          {getStatusIcon(member.status)}
                        </text>
                      </box>
                    );
                  }}
                </For>
              </Show>
            </box>

            <box width={2}>
              <text fg={terminalColors.border}>│</text>
            </box>

            <box flexDirection="column" width={35}>
              <text
                fg={
                  focusedPane() === 'skills'
                    ? terminalColors.accent
                    : terminalColors.text
                }
              >
                <b>Shared Skills</b>
              </text>
              <text> </text>

              <Show
                when={state().sharedSkills.length > 0}
                fallback={
                  <EmptyState
                    title="No shared skills"
                    description="Share skills with 's'"
                    compact
                  />
                }
              >
                <For each={state().sharedSkills.slice(0, 8)}>
                  {(skill, idx) => {
                    const selected = () =>
                      focusedPane() === 'skills' && idx() === selectedSkillIndex();
                    return (
                      <box flexDirection="row" marginBottom={1}>
                        <text
                          fg={selected() ? terminalColors.accent : terminalColors.text}
                          width={3}
                        >
                          {selected() ? '▸ ' : '  '}
                        </text>
                        <text
                          fg={selected() ? terminalColors.accent : terminalColors.text}
                          width={18}
                        >
                          {skill.name}
                        </text>
                        <text fg={terminalColors.textMuted}>
                          by {skill.sharedBy}
                        </text>
                      </box>
                    );
                  }}
                </For>
                <Show when={state().sharedSkills.length > 8}>
                  <text fg={terminalColors.textMuted}>
                    +{state().sharedSkills.length - 8} more
                  </text>
                </Show>
              </Show>
            </box>
          </box>

          <Show when={showDetail()}>
            <Show when={focusedPane() === 'members' && selectedMember()}>
              <DetailPane
                title={selectedMember()!.name}
                subtitle={selectedMember()!.role}
                icon="◉"
                fields={memberDetailFields()}
                actions={[
                  { key: 's', label: 'Share Skill' },
                  { key: 'd', label: 'Remove' },
                  { key: 'Esc', label: 'Close' },
                ]}
                width={30}
                visible={showDetail()}
                onClose={() => setShowDetail(false)}
              />
            </Show>
            <Show when={focusedPane() === 'skills' && selectedSharedSkill()}>
              <DetailPane
                title={selectedSharedSkill()!.name}
                subtitle={`Shared by ${selectedSharedSkill()!.sharedBy}`}
                icon="◇"
                fields={skillDetailFields()}
                actions={[
                  { key: 'i', label: 'Install' },
                  { key: 'Esc', label: 'Close' },
                ]}
                width={30}
                visible={showDetail()}
                onClose={() => setShowDetail(false)}
              />
            </Show>
          </Show>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          Tab/←/→ switch pane  j/k navigate  Enter details  i init  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

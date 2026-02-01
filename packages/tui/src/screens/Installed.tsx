import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen, loadSkills, filterSkills } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface InstalledProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Installed(props: InstalledProps) {
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchMode, setSearchMode] = createSignal(false);
  const [animPhase, setAnimPhase] = createSignal(0);
  const [spinnerFrame, setSpinnerFrame] = createSignal(0);
  const [skills, setSkills] = createSignal<ReturnType<typeof loadSkills>>({
    skills: [],
    loading: true,
    error: null,
  });

  const cols = () => props.cols ?? 80;
  const rows = () => props.rows ?? 24;
  const isCompact = () => cols() < 60;
  const contentWidth = () => Math.max(1, Math.min(cols() - 4, 60));

  createEffect(() => {
    if (animPhase() >= 2) return;
    const timer = setTimeout(() => setAnimPhase((p) => p + 1), 100);
    onCleanup(() => clearTimeout(timer));
  });

  createEffect(() => {
    if (!skills().loading) return;
    const interval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER.length);
    }, 80);
    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    const data = loadSkills();
    setSkills(data);
  });

  const filteredSkills = createMemo(() => filterSkills(skills().skills, searchQuery()));

  const handleKeyNav = (delta: number) => {
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, filteredSkills().length - 1)));
  };

  const handleToggle = () => {
    if (filteredSkills().length === 0) return;
    const skill = filteredSkills()[selectedIndex()];
    if (skill) {
      setSkills((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s.name === skill.name ? { ...s, enabled: s.enabled === false } : s)),
      }));
    }
  };

  useKeyboard((key: { name?: string; sequence?: string }) => {
    if (searchMode()) {
      if (key.name === 'escape') {
        setSearchMode(false);
      } else if (key.name === 'backspace') {
        setSearchQuery((prev) => prev.slice(0, -1));
      } else if (key.name === 'return') {
        setSearchMode(false);
      } else if (key.sequence && key.sequence.length === 1 && /[a-zA-Z0-9\-_.]/.test(key.sequence)) {
        setSearchQuery((prev) => prev + key.sequence);
        setSelectedIndex(0);
      }
      return;
    }

    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.sequence === '/') setSearchMode(true);
    else if (key.name === 'return') handleToggle();
    else if (key.name === 'd') handleToggle();
    else if (key.name === 'escape') props.onNavigate('home');
  });

  createEffect(() => {
    if (selectedIndex() >= filteredSkills().length && filteredSkills().length > 0) {
      setSelectedIndex(filteredSkills().length - 1);
    }
  });

  const maxVisible = () => Math.max(5, rows() - 10);
  const startIdx = () =>
    Math.max(0, Math.min(selectedIndex() - Math.floor(maxVisible() / 2), filteredSkills().length - maxVisible()));
  const visibleSkills = () => filteredSkills().slice(startIdx(), startIdx() + maxVisible());

  const divider = () => <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth())}</text>;

  const enabledCount = () => skills().skills.filter((s) => s.enabled !== false).length;
  const totalCount = () => skills().skills.length;

  const shortcuts = () =>
    isCompact()
      ? 'j/k nav   enter toggle   d disable   esc back'
      : 'j/k navigate   enter toggle   d disable   esc back';

  return (
    <box flexDirection="column" padding={1}>
      <Show when={animPhase() >= 1}>
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth()}>
            <text fg={terminalColors.success}>✓ Installed</text>
            <text fg={terminalColors.textMuted}>
              {enabledCount()}/{totalCount()} active
            </text>
          </box>
          <text fg={terminalColors.textMuted}>manage your skills</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted}>/ </text>
            <text fg={searchQuery() ? terminalColors.text : terminalColors.textMuted}>
              {searchQuery() || 'type to filter...'}
            </text>
          </box>
          <text> </text>
          {divider()}
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          <Show
            when={!skills().loading}
            fallback={
              <box flexDirection="row">
                <text fg={terminalColors.accent}>{SPINNER[spinnerFrame()]} </text>
                <text fg={terminalColors.text}>Loading skills...</text>
              </box>
            }
          >
            <Show
              when={!skills().error}
              fallback={
                <box flexDirection="column">
                  <text fg={terminalColors.error}>✗ Error loading skills</text>
                  <text fg={terminalColors.textMuted}>{skills().error}</text>
                </box>
              }
            >
              <Show
                when={filteredSkills().length > 0}
                fallback={
                  <box flexDirection="column">
                    <text fg={terminalColors.textMuted}>
                      {skills().skills.length === 0 ? 'No skills installed yet' : 'No skills match your search'}
                    </text>
                    <Show when={skills().skills.length === 0}>
                      <text> </text>
                      <text fg={terminalColors.textMuted}>Press 'b' to browse or 'm' for marketplace</text>
                    </Show>
                  </box>
                }
              >
                <box flexDirection="column">
                  <text fg={terminalColors.text}>Skills</text>
                  <text> </text>
                  <For each={visibleSkills()}>
                    {(skill, idx) => {
                      const actualIdx = () => startIdx() + idx();
                      const selected = () => actualIdx() === selectedIndex();
                      const indicator = () => (selected() ? '▸' : ' ');
                      const statusIcon = () => (skill.enabled !== false ? '●' : '○');
                      const qualityBadge = () => (skill.grade ? ` [${skill.grade}]` : '');
                      const warningIndicator = () => (skill.warnings && skill.warnings > 2 ? ' ⚠' : '');
                      const line = () =>
                        `${indicator()}${statusIcon()} ${skill.name}${qualityBadge()}${warningIndicator()}`;
                      const badgeColor = () =>
                        skill.quality !== undefined
                          ? skill.quality >= 80
                            ? terminalColors.success
                            : skill.quality >= 60
                              ? terminalColors.warning
                              : terminalColors.error
                          : terminalColors.text;
                      return <text fg={selected() ? terminalColors.accent : badgeColor()}>{line()}</text>;
                    }}
                  </For>

                  <Show when={filteredSkills().length > maxVisible()}>
                    <text fg={terminalColors.textMuted}>
                      {'\n'}showing {startIdx() + 1}-{Math.min(startIdx() + maxVisible(), filteredSkills().length)} of{' '}
                      {filteredSkills().length}
                    </text>
                  </Show>
                </box>
              </Show>
            </Show>
          </Show>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text fg={terminalColors.textMuted}>{shortcuts()}</text>
        </box>
      </Show>
    </box>
  );
}

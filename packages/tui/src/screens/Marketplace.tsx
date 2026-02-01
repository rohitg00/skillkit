import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import {
  type Screen,
  DEFAULT_REPOS,
  fetchRepoSkills,
  filterMarketplaceSkills,
  type FetchedSkill,
} from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { SearchInput } from '../components/SearchInput.js';

interface MarketplaceProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const CATEGORIES = [
  { name: 'Development', tag: 'development' },
  { name: 'Testing', tag: 'testing' },
  { name: 'DevOps', tag: 'devops' },
  { name: 'Security', tag: 'security' },
  { name: 'AI/ML', tag: 'ai' },
];

export function Marketplace(props: MarketplaceProps) {
  const [allSkills, setAllSkills] = createSignal<FetchedSkill[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [selectedCategory, setSelectedCategory] = createSignal<string | null>(null);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [loadedRepos, setLoadedRepos] = createSignal<string[]>([]);
  const [failedRepos, setFailedRepos] = createSignal<string[]>([]);

  const rows = () => props.rows ?? 24;

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const skills: FetchedSkill[] = [];
    const loaded: string[] = [];
    const failed: string[] = [];

    for (const repo of DEFAULT_REPOS.slice(0, 5)) {
      try {
        const result = await fetchRepoSkills(repo.source, DEFAULT_REPOS);
        if (result.skills.length > 0) {
          skills.push(...result.skills);
          loaded.push(repo.name);
        } else if (result.error) {
          failed.push(repo.name);
        }
      } catch {
        failed.push(repo.name);
      }
    }

    setAllSkills(skills);
    setLoadedRepos(loaded);
    setFailedRepos(failed);

    const attemptedCount = DEFAULT_REPOS.slice(0, 5).length;
    if (failed.length === attemptedCount) {
      setError(`Failed to load all repos: ${failed.join(', ')}`);
    } else if (failed.length > 0 && skills.length === 0) {
      setError(`Some repos failed (${failed.join(', ')}) and no skills loaded`);
    }

    setLoading(false);
  };

  const filteredSkills = createMemo(() => {
    let skills = allSkills();

    if (selectedCategory()) {
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(selectedCategory()!.toLowerCase()) ||
          s.description?.toLowerCase().includes(selectedCategory()!.toLowerCase())
      );
    }

    if (searchQuery()) {
      skills = filterMarketplaceSkills(skills, searchQuery());
    }

    return skills;
  });

  createEffect(() => {
    const list = filteredSkills();
    const maxIndex = Math.max(0, list.length - 1);
    setSelectedIndex((prev) => Math.max(0, Math.min(prev, maxIndex)));
  });

  const maxVisible = () => Math.max(4, Math.floor((rows() - 14) / 2));

  const skillsWindow = createMemo(() => {
    const list = filteredSkills();
    const selected = selectedIndex();
    const visible = maxVisible();
    const total = list.length;
    if (total <= visible) return { start: 0, items: list };
    let start = Math.max(0, selected - Math.floor(visible / 2));
    start = Math.min(start, total - visible);
    return { start, items: list.slice(start, start + visible) };
  });

  const handleKeyNav = (delta: number) => {
    const max = filteredSkills().length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  const handleInstall = () => {
    const skill = filteredSkills()[selectedIndex()];
    if (skill) {
      props.onNavigate('installed');
    }
  };

  const handleCategorySelect = (idx: number) => {
    const cat = CATEGORIES[idx];
    if (cat) {
      setSelectedCategory((prev) => (prev === cat.tag ? null : cat.tag));
      setSelectedIndex(0);
    }
  };

  useKeyboard((key: { name?: string; sequence?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleInstall();
    else if (key.name === 'b') props.onNavigate('browse');
    else if (key.name === 'r') loadData();
    else if (key.sequence && ['1', '2', '3', '4', '5'].includes(key.sequence)) {
      handleCategorySelect(parseInt(key.sequence) - 1);
    } else if (key.name === 'escape') {
      if (searchQuery() || selectedCategory()) {
        setSearchQuery('');
        setSelectedCategory(null);
      } else {
        props.onNavigate('home');
      }
    }
  });

  const selectedSkill = () => {
    const skills = filteredSkills();
    if (skills.length === 0) return null;
    return skills[selectedIndex()];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Marketplace"
        subtitle="Discover and install skills"
        icon="★"
        count={allSkills().length}
      />

      <Show when={error()}>
        <ErrorState
          message={error()!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={loading()}>
        <box flexDirection="column">
          <Spinner label="Loading marketplace skills..." />
          <Show when={loadedRepos().length > 0}>
            <text fg={terminalColors.textMuted}>
              Loaded: {loadedRepos().join(', ')}
            </text>
          </Show>
        </box>
      </Show>

      <Show when={!loading() && !error()}>
        <box flexDirection="row" marginBottom={1}>
          <text fg={terminalColors.success}>
            ● {loadedRepos().length} repos
          </text>
          <Show when={failedRepos().length > 0}>
            <text fg={terminalColors.textMuted}> | </text>
            <text fg={terminalColors.warning}>
              ○ {failedRepos().length} failed
            </text>
          </Show>
          <text fg={terminalColors.textMuted}> | </text>
          <text fg={terminalColors.text}>{allSkills().length} skills</text>
        </box>

        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <box flexDirection="row" marginBottom={1}>
          <text fg={terminalColors.text}>Categories: </text>
          <For each={CATEGORIES}>
            {(cat, idx) => (
              <text
                fg={
                  selectedCategory() === cat.tag
                    ? terminalColors.accent
                    : terminalColors.textMuted
                }
              >
                [{idx() + 1}]{cat.name}{' '}
              </text>
            )}
          </For>
        </box>

        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <Show
          when={filteredSkills().length > 0}
          fallback={
            <EmptyState
              icon="★"
              title="No skills found"
              description={
                searchQuery() || selectedCategory()
                  ? 'Try a different search or category'
                  : 'No skills loaded yet'
              }
              action={{ label: 'Clear Filter', key: 'Esc' }}
            />
          }
        >
          <text fg={terminalColors.text}>
            <b>
              {selectedCategory() ? `${selectedCategory()} Skills` : 'Featured Skills'}
            </b>{' '}
            <text fg={terminalColors.textMuted}>
              ({filteredSkills().length} results)
            </text>
          </text>
          <text> </text>

          <Show when={skillsWindow().start > 0}>
            <text fg={terminalColors.textMuted}>  ▲ {skillsWindow().start} more</text>
          </Show>
          <For each={skillsWindow().items}>
            {(skill, idx) => {
              const originalIndex = () => skillsWindow().start + idx();
              const isSelected = () => originalIndex() === selectedIndex();
              return (
                <box flexDirection="column" marginBottom={1}>
                  <box flexDirection="row">
                    <text
                      fg={isSelected() ? terminalColors.accent : terminalColors.text}
                      width={3}
                    >
                      {isSelected() ? '▸ ' : '  '}
                    </text>
                    <text
                      fg={isSelected() ? terminalColors.accent : terminalColors.text}
                      width={25}
                    >
                      {skill.name}
                    </text>
                    <text fg={terminalColors.textMuted}>
                      {skill.repoName}
                    </text>
                  </box>
                  <Show when={skill.description}>
                    <text fg={terminalColors.textMuted}>
                      {'   '}{skill.description?.slice(0, 50)}
                      {(skill.description?.length || 0) > 50 ? '...' : ''}
                    </text>
                  </Show>
                </box>
              );
            }}
          </For>

          <Show when={skillsWindow().start + maxVisible() < filteredSkills().length}>
            <text fg={terminalColors.textMuted}>
              ▼ {filteredSkills().length - skillsWindow().start - maxVisible()} more
            </text>
          </Show>
        </Show>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter install  1-5 category  b browse  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

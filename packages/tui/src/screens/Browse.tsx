import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import {
  type Screen,
  DEFAULT_REPOS,
  getMarketplaceRepos,
  fetchRepoSkills,
  type FetchedSkill,
  type RepoInfo,
} from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState, ErrorState } from '../components/EmptyState.js';
import { DetailPane } from '../components/DetailPane.js';
import { StatusIndicator } from '../components/StatusIndicator.js';

interface BrowseProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface RepoWithSkills extends RepoInfo {
  skills: FetchedSkill[];
  loading: boolean;
  error: string | null;
}

export function Browse(props: BrowseProps) {
  const [repos, setRepos] = createSignal<RepoWithSkills[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchMode, setSearchMode] = createSignal(false);
  const [showSkills, setShowSkills] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const cols = () => props.cols ?? 80;
  const rows = () => props.rows ?? 24;
  const contentWidth = () => Math.max(1, Math.min(cols() - 4, 60));

  createEffect(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const marketplaceRepos = getMarketplaceRepos();
      const reposWithState: RepoWithSkills[] = marketplaceRepos.map((repo) => ({
        ...repo,
        skills: [],
        loading: false,
        error: null,
      }));
      setRepos(reposWithState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repos');
    }

    setLoading(false);
  };

  const loadRepoSkills = async (index: number) => {
    const repo = repos()[index];
    if (!repo || repo.skills.length > 0 || repo.loading) return;

    setRepos((prev) =>
      prev.map((r, i) => (i === index ? { ...r, loading: true, error: null } : r))
    );

    try {
      const result = await fetchRepoSkills(repo.source, DEFAULT_REPOS);
      setRepos((prev) =>
        prev.map((r, i) =>
          i === index
            ? {
                ...r,
                skills: result.skills,
                loading: false,
                error: result.error || null,
              }
            : r
        )
      );
    } catch (err) {
      setRepos((prev) =>
        prev.map((r, i) =>
          i === index
            ? {
                ...r,
                loading: false,
                error: err instanceof Error ? err.message : 'Failed to fetch',
              }
            : r
        )
      );
    }
  };

  const filteredRepos = createMemo(() => {
    if (!searchQuery()) return repos();

    const query = searchQuery().toLowerCase();
    return repos().filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query)
    );
  });

  const maxVisible = () => Math.max(5, rows() - 12);
  const startIdx = () =>
    Math.max(
      0,
      Math.min(
        selectedIndex() - Math.floor(maxVisible() / 2),
        filteredRepos().length - maxVisible()
      )
    );
  const visibleRepos = () =>
    filteredRepos().slice(startIdx(), startIdx() + maxVisible());

  const handleKeyNav = (delta: number) => {
    const max = filteredRepos().length - 1;
    setSelectedIndex((prev) => Math.max(0, Math.min(prev + delta, max)));
  };

  const handleOpenRepo = () => {
    const repo = filteredRepos()[selectedIndex()];
    if (repo) {
      const actualIndex = repos().findIndex(
        (r) => r.source === repo.source && r.name === repo.name
      );
      if (actualIndex !== -1) {
        loadRepoSkills(actualIndex);
      }
      setShowSkills(true);
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
      } else if (
        key.sequence &&
        key.sequence.length === 1 &&
        /[a-zA-Z0-9\-_.]/.test(key.sequence)
      ) {
        setSearchQuery((prev) => prev + key.sequence);
        setSelectedIndex(0);
      }
      return;
    }

    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.sequence === '/') setSearchMode(true);
    else if (key.name === 'return') handleOpenRepo();
    else if (key.name === 'r') loadData();
    else if (key.name === 'escape') {
      if (showSkills()) setShowSkills(false);
      else if (searchQuery()) setSearchQuery('');
      else props.onNavigate('home');
    }
  });

  createEffect(() => {
    if (selectedIndex() >= filteredRepos().length && filteredRepos().length > 0) {
      setSelectedIndex(filteredRepos().length - 1);
    }
  });

  const selectedRepo = () => {
    const repoList = filteredRepos();
    if (repoList.length === 0) return null;
    return repoList[selectedIndex()];
  };

  const repoDetailFields = () => {
    const repo = selectedRepo();
    if (!repo) return [];

    return [
      { label: 'Name', value: repo.name },
      { label: 'Source', value: repo.source },
      { label: 'Skills', value: String(repo.skills.length) },
      {
        label: 'Status',
        value: repo.loading ? 'Loading...' : repo.error ? 'Error' : 'Ready',
      },
    ];
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Browse"
        subtitle="Explore skill repositories"
        icon="⌕"
        count={repos().length}
      />

      <Show when={error()}>
        <ErrorState
          message={error()!}
          action={{ label: 'Retry', key: 'r' }}
          compact
        />
      </Show>

      <Show when={loading()}>
        <Spinner label="Loading repositories..." />
      </Show>

      <Show when={!loading() && !error()}>
        <box flexDirection="row" marginBottom={1}>
          <text fg={terminalColors.textMuted}>/ </text>
          <text
            fg={
              searchQuery() || searchMode()
                ? terminalColors.text
                : terminalColors.textMuted
            }
          >
            {searchQuery() || (searchMode() ? '|' : 'type to filter...')}
          </text>
        </box>

        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text> </text>

        <box flexDirection="row">
          <box flexDirection="column" flexGrow={1}>
            <Show
              when={filteredRepos().length > 0}
              fallback={
                <EmptyState
                  icon="⌕"
                  title="No repositories found"
                  description={
                    searchQuery()
                      ? 'Try a different search term'
                      : 'No repositories configured'
                  }
                />
              }
            >
              <text fg={terminalColors.text}>
                <b>Repositories</b>{' '}
                <text fg={terminalColors.textMuted}>
                  ({filteredRepos().length})
                </text>
              </text>
              <text> </text>

              <For each={visibleRepos()}>
                {(repo, idx) => {
                  const actualIdx = () => startIdx() + idx();
                  const selected = () => actualIdx() === selectedIndex();
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
                        width={25}
                      >
                        {repo.name}
                      </text>
                      <text fg={terminalColors.textMuted} width={10}>
                        {repo.skills.length > 0
                          ? `${repo.skills.length} skills`
                          : repo.loading
                            ? 'loading...'
                            : ''}
                      </text>
                      <Show when={repo.error}>
                        <text fg={terminalColors.error}>✗</text>
                      </Show>
                    </box>
                  );
                }}
              </For>

              <Show when={filteredRepos().length > maxVisible()}>
                <text fg={terminalColors.textMuted}>
                  showing {startIdx() + 1}-
                  {Math.min(startIdx() + maxVisible(), filteredRepos().length)} of{' '}
                  {filteredRepos().length}
                </text>
              </Show>
            </Show>
          </box>

          <Show when={showSkills() && selectedRepo()}>
            <DetailPane
              title={selectedRepo()!.name}
              subtitle={`${selectedRepo()!.skills.length} skills`}
              icon="⌕"
              fields={repoDetailFields()}
              actions={[
                { key: 'Enter', label: 'Install' },
                { key: 'Esc', label: 'Close' },
              ]}
              width={35}
              visible={showSkills()}
              onClose={() => setShowSkills(false)}
            >
              <Show when={selectedRepo()!.loading}>
                <StatusIndicator status="loading" label="Loading skills..." />
              </Show>
              <Show when={selectedRepo()!.skills.length > 0}>
                <text fg={terminalColors.text}>
                  <b>Skills:</b>
                </text>
                <For each={selectedRepo()!.skills.slice(0, 5)}>
                  {(skill) => (
                    <text fg={terminalColors.textSecondary}>• {skill.name}</text>
                  )}
                </For>
                <Show when={selectedRepo()!.skills.length > 5}>
                  <text fg={terminalColors.textMuted}>
                    +{selectedRepo()!.skills.length - 5} more
                  </text>
                </Show>
              </Show>
            </DetailPane>
          </Show>
        </box>

        <text> </text>
        <text fg={terminalColors.textMuted}>─────────────────────────────────────────────</text>
        <text fg={terminalColors.textMuted}>
          j/k navigate  Enter open  / search  r refresh  Esc back
        </text>
      </Show>
    </box>
  );
}

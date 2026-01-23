import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';

interface MarketplaceSkill {
  name: string;
  description: string;
  source: string;
  repo: string;
  tags?: string[];
  stars?: number;
}

interface Props {
  cols?: number;
  rows?: number;
}

// Known skill repositories to aggregate from
const SKILL_SOURCES = [
  { owner: 'composioHQ', repo: 'awesome-claude-code-skills', name: 'Composio Curated' },
  { owner: 'anthropics', repo: 'courses', name: 'Anthropic Official' },
];

export function Marketplace({ rows = 24 }: Props) {
  const [skills, setSkills] = useState<MarketplaceSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState(0);
  const [search, setSearch] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const maxVisible = Math.max(5, rows - 10);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), filtered.length - maxVisible));
  const visible = filtered.slice(start, start + maxVisible);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    setLoading(true);
    setError(null);

    try {
      // Aggregate skills from known sources
      const allSkills: MarketplaceSkill[] = [];

      for (const source of SKILL_SOURCES) {
        try {
          // Try to fetch skill index from GitHub
          const indexUrl = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/main/skills.json`;
          const response = await fetch(indexUrl);

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              allSkills.push(...data.map((s: Record<string, unknown>) => ({
                name: String(s.name || 'Unknown'),
                description: String(s.description || ''),
                source: source.name,
                repo: `${source.owner}/${source.repo}`,
                tags: Array.isArray(s.tags) ? s.tags as string[] : [],
                stars: typeof s.stars === 'number' ? s.stars : undefined,
              })));
            }
          } else {
            // Fallback: add the repo itself as a skill source
            allSkills.push({
              name: source.repo,
              description: `Skills from ${source.name}`,
              source: source.name,
              repo: `${source.owner}/${source.repo}`,
            });
          }
        } catch {
          // Add repo as fallback
          allSkills.push({
            name: source.repo,
            description: `Skills from ${source.name}`,
            source: source.name,
            repo: `${source.owner}/${source.repo}`,
          });
        }
      }

      // Add some example skills for demo
      if (allSkills.length === 0) {
        allSkills.push(
          { name: 'typescript-strict', description: 'Enable strict TypeScript mode', source: 'Built-in', repo: 'skillkit/skills', tags: ['typescript', 'config'] },
          { name: 'eslint-setup', description: 'Set up ESLint with recommended rules', source: 'Built-in', repo: 'skillkit/skills', tags: ['eslint', 'linting'] },
          { name: 'prettier-config', description: 'Configure Prettier formatting', source: 'Built-in', repo: 'skillkit/skills', tags: ['prettier', 'formatting'] },
          { name: 'jest-setup', description: 'Set up Jest testing framework', source: 'Built-in', repo: 'skillkit/skills', tags: ['jest', 'testing'] },
          { name: 'nextjs-auth', description: 'Add authentication to Next.js', source: 'Community', repo: 'community/skills', tags: ['nextjs', 'auth'] },
        );
      }

      setSkills(allSkills);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace');
    }

    setLoading(false);
  };

  useInput((input, key) => {
    if (loading || installing) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(filtered.length - 1, i + 1));
    else if (input === 'r') loadMarketplace();
    else if (input === '/') setSearch('');
    else if (key.backspace || key.delete) setSearch(s => s.slice(0, -1));
    else if (key.return && filtered[sel]) {
      setInstalling(filtered[sel].name);
      // Simulate installation
      setTimeout(() => setInstalling(null), 1500);
    }
    else if (input.length === 1 && /[a-zA-Z0-9-_]/.test(input)) {
      setSearch(s => s + input);
      setSel(0);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>SKILL MARKETPLACE</Text>
      <Text dimColor>{skills.length} skills from {SKILL_SOURCES.length} sources</Text>

      {search && (
        <Text>Search: <Text color="yellow">{search}</Text> ({filtered.length} results)</Text>
      )}

      {loading && <Text>Loading marketplace...</Text>}
      {error && <Text color="red">{error}</Text>}
      {installing && <Text color="yellow">Installing {installing}...</Text>}

      {!loading && !installing && filtered.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No skills found{search ? ` matching "${search}"` : ''}.</Text>
        </Box>
      )}

      {!loading && !installing && filtered.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((skill, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            return (
              <Box key={`${skill.repo}/${skill.name}`} flexDirection="column">
                <Text inverse={isSel}>
                  {isSel ? symbols.pointer : ' '} {skill.name.padEnd(25)} <Text dimColor>{skill.source}</Text>
                </Text>
                {isSel && (
                  <Box flexDirection="column" marginLeft={3}>
                    <Text dimColor>{skill.description}</Text>
                    {skill.tags && skill.tags.length > 0 && (
                      <Text dimColor>Tags: {skill.tags.join(', ')}</Text>
                    )}
                    <Text dimColor>Repo: {skill.repo}</Text>
                  </Box>
                )}
              </Box>
            );
          })}
          {start + maxVisible < filtered.length && <Text dimColor>  ↓ {filtered.length - start - maxVisible} more</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Enter=install  type=search  r=refresh  q=quit</Text>
      </Box>
    </Box>
  );
}

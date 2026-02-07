import { useState, useEffect } from 'react';

interface Stats {
  version: string;
  downloads: string;
  stars: number;
  phUpvotes: number;
  loading: boolean;
}

const CACHE_KEY = 'skillkit_stats_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedStats {
  data: Omit<Stats, 'loading'>;
  timestamp: number;
}

function formatDownloads(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function getCachedStats(): CachedStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedStats = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

function setCachedStats(data: Omit<Stats, 'loading'>): void {
  try {
    const cached: CachedStats = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
}

export function useStats(): Stats {
  const [stats, setStats] = useState<Stats>({
    version: '1.9.0',
    downloads: '2.4k',
    stars: 66,
    phUpvotes: 0,
    loading: true,
  });

  useEffect(() => {
    const cached = getCachedStats();
    if (cached) {
      setStats({ ...cached.data, loading: false });
      return;
    }

    async function fetchStats(): Promise<void> {
      try {
        const [npmResponse, githubResponse, phResponse] = await Promise.allSettled([
          fetch('https://api.npmjs.org/downloads/point/last-month/skillkit'),
          fetch('https://api.github.com/repos/rohitg00/skillkit'),
          fetch('https://api.producthunt.com/v2/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{ post(slug: "skillkit-2") { votesCount } }' }),
          }),
        ]);

        let downloads = '2.4k';
        let stars = 66;
        let phUpvotes = 0;
        let version = '1.9.0';

        if (npmResponse.status === 'fulfilled' && npmResponse.value.ok) {
          const npmData = await npmResponse.value.json();
          if (typeof npmData.downloads === 'number' && Number.isFinite(npmData.downloads)) {
            downloads = formatDownloads(npmData.downloads);
          }
        }

        if (githubResponse.status === 'fulfilled' && githubResponse.value.ok) {
          const githubData = await githubResponse.value.json();
          if (typeof githubData.stargazers_count === 'number' && Number.isFinite(githubData.stargazers_count)) {
            stars = githubData.stargazers_count;
          }
        }

        if (phResponse.status === 'fulfilled' && phResponse.value.ok) {
          try {
            const phData = await phResponse.value.json();
            const votes = phData?.data?.post?.votesCount;
            if (typeof votes === 'number' && Number.isFinite(votes)) {
              phUpvotes = votes;
            }
          } catch {
            // PH API may require auth, fall back silently
          }
        }

        try {
          const registryResponse = await fetch('https://registry.npmjs.org/skillkit/latest');
          if (registryResponse.ok) {
            const registryData = await registryResponse.json();
            if (registryData.version) {
              version = registryData.version;
            }
          }
        } catch {
          // Use default version
        }

        const newStats = { version, downloads, stars, phUpvotes };
        setCachedStats(newStats);
        setStats({ ...newStats, loading: false });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
  }, []);

  return stats;
}

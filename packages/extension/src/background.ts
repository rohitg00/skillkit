import type { SaveResponse, ErrorResponse, ExtensionMessage } from './types';

const TECH_KEYWORDS = new Set([
  'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'node', 'deno', 'bun',
  'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'kotlin', 'swift',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ansible',
  'graphql', 'rest', 'api', 'sql', 'nosql', 'redis', 'postgres', 'mongodb',
  'testing', 'ci', 'cd', 'git', 'webpack', 'vite', 'tailwind', 'css',
  'ai', 'ml', 'llm', 'mcp', 'agent', 'prompt', 'rag', 'embedding',
]);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-page',
    title: 'Save page as Skill',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'save-selection',
    title: 'Save selection as Skill',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  try {
    if (info.menuItemId === 'save-page') {
      const pageInfo = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_INFO' });
      if (pageInfo?.type === 'PAGE_INFO') {
        const { url, title, markdown } = pageInfo.payload;
        const result = generateAndDownload({ url, title, content: markdown });
        notifyTab(tab.id, result);
      }
    }

    if (info.menuItemId === 'save-selection' && info.selectionText) {
      const url = tab.url ?? '';
      const result = generateAndDownload({ url, title: '', content: info.selectionText });
      notifyTab(tab.id, result);
    }
  } catch {
    notifyTab(tab.id, { error: 'Failed to extract page content' });
  }
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'SAVE_PAGE') {
      const { url, title, markdown, name } = message.payload;
      sendResponse(generateAndDownload({ url, title, content: markdown, name }));
    } else if (message.type === 'SAVE_SELECTION') {
      const { text, url, name } = message.payload;
      sendResponse(generateAndDownload({ url, title: '', content: text, name }));
    }
    return false;
  },
);

interface GenerateInput {
  url: string;
  title: string;
  content: string;
  name?: string;
}

function generateAndDownload(input: GenerateInput): SaveResponse | ErrorResponse {
  try {
    const name = slugify(input.name || input.title || titleFromUrl(input.url));
    const tags = detectTags(input.url, input.content);
    const description = makeDescription(input.content);
    const savedAt = new Date().toISOString();

    const yamlTags = tags.length > 0
      ? `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}\n`
      : '';

    const skillMd =
      `---\n` +
      `name: ${name}\n` +
      `description: ${yamlEscape(description)}\n` +
      yamlTags +
      `metadata:\n` +
      (input.url ? `  source: ${input.url}\n` : '') +
      `  savedAt: ${savedAt}\n` +
      `---\n\n` +
      input.content + '\n';

    const filename = `${name}/SKILL.md`;

    const blob = new Blob([skillMd], { type: 'text/markdown' });
    const blobUrl = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: blobUrl,
      filename: `skillkit-skills/${filename}`,
      saveAs: false,
    }, () => {
      URL.revokeObjectURL(blobUrl);
    });

    return { name, filename, skillMd, tags };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Generation failed' };
  }
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug.slice(0, 64).replace(/-+$/, '') || 'untitled-skill';
}

function titleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const last = pathname.split('/').filter(Boolean).pop();
    return last ?? 'untitled';
  } catch {
    return 'untitled';
  }
}

function makeDescription(content: string): string {
  const firstLine = content.split('\n').find((l) => l.trim().length > 0) ?? '';
  const cleaned = firstLine.replace(/^#+\s*/, '').trim();
  if (cleaned.length > 200) return cleaned.slice(0, 197) + '...';
  return cleaned || 'Saved skill';
}

function yamlEscape(value: string): string {
  const singleLine = value.replace(/\r?\n/g, ' ').trim();
  if (/[:#{}[\],&*?|>!%@`]/.test(singleLine) || singleLine.startsWith("'") || singleLine.startsWith('"')) {
    return `"${singleLine.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return singleLine;
}

function detectTags(url: string, content: string): string[] {
  const text = `${url} ${content}`.toLowerCase();
  const found: string[] = [];
  for (const kw of TECH_KEYWORDS) {
    if (text.includes(kw)) found.push(kw);
    if (found.length >= 10) break;
  }
  return found;
}

function notifyTab(tabId: number, result: SaveResponse | ErrorResponse): void {
  const isError = 'error' in result;
  chrome.action.setBadgeText({ text: isError ? '!' : '\u2713', tabId });
  chrome.action.setBadgeBackgroundColor({ color: isError ? '#ef4444' : '#22c55e', tabId });
  setTimeout(() => chrome.action.setBadgeText({ text: '', tabId }), 3000);
}

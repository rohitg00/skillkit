import type { SaveResponse, ErrorResponse, ExtensionMessage } from './types';

const API_URL = 'https://agenstskills.com/api/save-skill';

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
      const url = tab.url ?? '';
      if (!url || url.startsWith('chrome://') || url.startsWith('about:')) {
        notifyTab(tab.id, { error: 'Cannot save skills from this page' });
        return;
      }
      const result = await callSaveApi(url);
      if (!('error' in result)) {
        downloadSkill(result.name, result.skillMd);
      }
      notifyTab(tab.id, result);
    }

    if (info.menuItemId === 'save-selection' && info.selectionText) {
      const url = tab.url ?? '';
      const result = buildSelectionSkill(info.selectionText, url);
      downloadSkill(result.name, result.skillMd);
      notifyTab(tab.id, result);
    }
  } catch {
    notifyTab(tab.id, { error: 'Failed to save skill' });
  }
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'SAVE_PAGE') {
      const { url, name } = message.payload;
      callSaveApi(url, name).then((result) => {
        if (!('error' in result)) {
          downloadSkill(result.name, result.skillMd);
        }
        sendResponse(result);
      }).catch(() => {
        sendResponse({ error: 'Failed to save skill' });
      });
      return true;
    }

    if (message.type === 'SAVE_SELECTION') {
      const { text, url, name } = message.payload;
      const result = buildSelectionSkill(text, url, name);
      downloadSkill(result.name, result.skillMd);
      sendResponse(result);
    }

    return false;
  },
);

async function callSaveApi(url: string, name?: string): Promise<SaveResponse | ErrorResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, name }),
  });

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    return { error: `Server error: ${response.status}` };
  }
  if (!response.ok) {
    return { error: (data.error as string) ?? `Server error: ${response.status}` };
  }
  return {
    name: data.name as string,
    filename: `${data.name}/SKILL.md`,
    skillMd: data.skillMd as string,
    tags: (data.tags as string[]) ?? [],
  };
}

function buildSelectionSkill(text: string, url: string, name?: string): SaveResponse {
  const skillName = slugify(name || 'selection');
  const savedAt = new Date().toISOString();

  const skillMd =
    `---\n` +
    `name: ${skillName}\n` +
    `description: Selected text saved as skill\n` +
    `metadata:\n` +
    (url ? `  source: ${yamlEscape(url)}\n` : '') +
    `  savedAt: ${savedAt}\n` +
    `---\n\n` +
    text + '\n';

  return {
    name: skillName,
    filename: `${skillName}/SKILL.md`,
    skillMd,
    tags: [],
  };
}

function yamlEscape(value: string): string {
  const singleLine = value.replace(/\r?\n/g, ' ').trim();
  if (/[:#{}[\],&*?|>!%@`]/.test(singleLine) || singleLine.startsWith("'") || singleLine.startsWith('"')) {
    return `"${singleLine.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return singleLine;
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug.slice(0, 64).replace(/-+$/, '') || 'untitled-skill';
}

function downloadSkill(name: string, skillMd: string): void {
  const blob = new Blob([skillMd], { type: 'text/markdown' });
  const blobUrl = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: blobUrl,
    filename: `skillkit-skills/${name}/SKILL.md`,
    saveAs: false,
  }, () => {
    URL.revokeObjectURL(blobUrl);
  });
}

function notifyTab(tabId: number, result: SaveResponse | ErrorResponse): void {
  const isError = 'error' in result;
  chrome.action.setBadgeText({ text: isError ? '!' : '\u2713', tabId });
  chrome.action.setBadgeBackgroundColor({ color: isError ? '#ef4444' : '#22c55e', tabId });
  setTimeout(() => chrome.action.setBadgeText({ text: '', tabId }), 3000);
}

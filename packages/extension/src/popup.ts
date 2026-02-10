import type { ExtensionMessage, SaveResponse, ErrorResponse } from './types';

const pageTitle = document.getElementById('page-title')!;
const pageUrl = document.getElementById('page-url')!;
const skillNameInput = document.getElementById('skill-name') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn')!;
const saveSelectionBtn = document.getElementById('save-selection-btn')!;
const statusEl = document.getElementById('status')!;
const statusIcon = document.getElementById('status-icon')!;
const statusText = document.getElementById('status-text')!;
const resultEl = document.getElementById('result')!;
const resultPath = document.getElementById('result-path')!;

let currentUrl = '';
let currentSelection = '';
let currentMarkdown = '';
let currentTitle = '';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  pageTitle.textContent = tab.title || 'Unknown';
  pageUrl.textContent = tab.url || '\u2014';
  currentUrl = tab.url || '';
  currentTitle = tab.title || '';

  try {
    const response = await chrome.tabs.sendMessage(
      tab.id,
      { type: 'GET_PAGE_INFO' } satisfies ExtensionMessage,
    );
    if (response?.type === 'PAGE_INFO') {
      currentMarkdown = response.payload.markdown;
      currentSelection = response.payload.selection;
      currentTitle = response.payload.title || currentTitle;
      if (currentSelection) {
        saveSelectionBtn.style.display = 'block';
      }
    }
  } catch {
    // Content script not loaded (chrome:// pages, etc.)
  }
}

saveBtn.addEventListener('click', async () => {
  if (!currentUrl) return;
  await save({
    type: 'SAVE_PAGE',
    payload: {
      url: currentUrl,
      title: currentTitle,
      markdown: currentMarkdown,
      name: skillNameInput.value.trim() || undefined,
    },
  });
});

saveSelectionBtn.addEventListener('click', async () => {
  if (!currentSelection) return;
  await save({
    type: 'SAVE_SELECTION',
    payload: {
      text: currentSelection,
      url: currentUrl,
      name: skillNameInput.value.trim() || undefined,
    },
  });
});

function setButtonsDisabled(disabled: boolean): void {
  const method = disabled ? 'setAttribute' : 'removeAttribute';
  saveBtn[method]('disabled', '');
  saveSelectionBtn[method]('disabled', '');
}

async function save(message: ExtensionMessage) {
  setStatus('saving', 'Saving...');
  setButtonsDisabled(true);

  const response: SaveResponse | ErrorResponse | undefined =
    await chrome.runtime.sendMessage(message);

  setButtonsDisabled(false);

  if (!response) {
    setStatus('error', 'No response from background script');
    resultEl.style.display = 'none';
    return;
  }

  if ('error' in response) {
    setStatus('error', response.error);
    resultEl.style.display = 'none';
    return;
  }

  setStatus('success', `Saved "${response.name}"`);
  resultPath.textContent = `Downloads/skillkit-skills/${response.filename}`;
  resultEl.style.display = 'block';
}

function setStatus(type: 'saving' | 'success' | 'error', text: string) {
  statusEl.style.display = 'flex';
  statusEl.className = `status ${type}`;
  const icons = { saving: '...', success: '\u2713', error: '\u2717' };
  statusIcon.textContent = icons[type];
  statusText.textContent = text;
}

init();

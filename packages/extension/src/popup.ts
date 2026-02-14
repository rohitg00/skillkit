import type { ExtensionMessage, SaveResponse, ErrorResponse } from './types';

const pageTitle = document.getElementById('page-title')!;
const pageUrl = document.getElementById('page-url')!;
const skillNameInput = document.getElementById('skill-name') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn')!;
const statusEl = document.getElementById('status')!;
const statusIcon = document.getElementById('status-icon')!;
const statusText = document.getElementById('status-text')!;
const resultEl = document.getElementById('result')!;
const resultPath = document.getElementById('result-path')!;

let currentUrl = '';
let currentTitle = '';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  pageTitle.textContent = tab.title || 'Unknown';
  pageUrl.textContent = tab.url || '\u2014';
  currentUrl = tab.url || '';
  currentTitle = tab.title || '';

  const isRestricted = !currentUrl || currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://') || currentUrl.startsWith('about:');
  if (isRestricted) {
    saveBtn.setAttribute('disabled', '');
    setStatus('error', 'Cannot save skills from this page');
    return;
  }
}

saveBtn.addEventListener('click', async () => {
  if (!currentUrl) return;

  setStatus('saving', 'Saving...');
  saveBtn.setAttribute('disabled', '');

  const message: ExtensionMessage = {
    type: 'SAVE_PAGE',
    payload: {
      url: currentUrl,
      title: currentTitle,
      name: skillNameInput.value.trim() || undefined,
    },
  };

  const response: SaveResponse | ErrorResponse | undefined =
    await chrome.runtime.sendMessage(message);

  saveBtn.removeAttribute('disabled');

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
});

function setStatus(type: 'saving' | 'success' | 'error', text: string) {
  statusEl.style.display = 'flex';
  statusEl.className = `status ${type}`;
  const icons = { saving: '...', success: '\u2713', error: '\u2717' };
  statusIcon.textContent = icons[type];
  statusText.textContent = text;
}

init();

import TurndownService from 'turndown';
import type { ExtensionMessage, PageContent } from './types';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.remove(['script', 'style', 'nav', 'footer', 'iframe', 'noscript']);

function extractPageContent(): PageContent {
  const selection = window.getSelection()?.toString() ?? '';
  const description =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';

  const article = document.querySelector('article, main, [role="main"]');
  const source = article ?? document.body;
  const markdown = turndown.turndown(source.innerHTML);

  return {
    url: window.location.href,
    title: document.title || description || window.location.hostname,
    markdown,
    selection,
    description,
  };
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'GET_PAGE_INFO') {
      const content = extractPageContent();
      const response: ExtensionMessage = { type: 'PAGE_INFO', payload: content };
      sendResponse(response);
    }
    return false;
  },
);

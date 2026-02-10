export interface SaveResponse {
  name: string;
  filename: string;
  skillMd: string;
  tags: string[];
}

export interface ErrorResponse {
  error: string;
}

export interface PageContent {
  url: string;
  title: string;
  markdown: string;
  selection: string;
  description: string;
}

export type ExtensionMessage =
  | { type: 'SAVE_PAGE'; payload: { url: string; title: string; markdown: string; name?: string } }
  | { type: 'SAVE_SELECTION'; payload: { text: string; url: string; name?: string } }
  | { type: 'GET_PAGE_INFO' }
  | { type: 'PAGE_INFO'; payload: PageContent };

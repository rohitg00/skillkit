export interface SaveResponse {
  name: string;
  filename: string;
  skillMd: string;
  tags: string[];
}

export interface ErrorResponse {
  error: string;
}

export type ExtensionMessage =
  | { type: 'SAVE_PAGE'; payload: { url: string; title: string; name?: string } }
  | { type: 'SAVE_SELECTION'; payload: { text: string; url: string; name?: string } };

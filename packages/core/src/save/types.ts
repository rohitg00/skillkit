export interface ExtractedContent {
  title: string;
  content: string;
  sourceUrl?: string;
  sourcePath?: string;
  tags: string[];
  extractedAt: string;
  contentType: 'webpage' | 'github' | 'text' | 'code' | 'file';
  language?: string;
  metadata: Record<string, string>;
}

export interface ExtractionOptions {
  includeImages?: boolean;
  maxLength?: number;
  preferredTitle?: string;
}

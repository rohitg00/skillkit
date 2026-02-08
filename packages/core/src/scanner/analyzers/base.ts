import type { Finding } from '../types.js';

export interface Analyzer {
  name: string;
  analyze(skillPath: string, files: string[]): Promise<Finding[]>;
}

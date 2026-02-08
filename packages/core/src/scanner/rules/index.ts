import type { SecurityRule } from '../types.js';
import { promptInjectionRules } from './prompt-injection.js';
import { commandInjectionRules } from './command-injection.js';
import { dataExfiltrationRules } from './data-exfiltration.js';
import { toolAbuseRules } from './tool-abuse.js';
import { unicodeRules } from './unicode.js';

export function getAllRules(): SecurityRule[] {
  return [
    ...promptInjectionRules,
    ...commandInjectionRules,
    ...dataExfiltrationRules,
    ...toolAbuseRules,
    ...unicodeRules,
  ];
}

export {
  promptInjectionRules,
  commandInjectionRules,
  dataExfiltrationRules,
  toolAbuseRules,
  unicodeRules,
};

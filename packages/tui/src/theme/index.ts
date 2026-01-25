/**
 * Theme module for SkillKit TUI
 * Monochromatic design system with animations
 */

export {
  colors,
  terminalColors,
  getColor,
  type ColorName,
  type ColorValue,
} from './colors.js';

export {
  symbols,
  AGENT_LOGOS,
  getAgentLogo,
  getAgentTypes,
  formatAgentDisplay,
  type AgentLogo,
  type SymbolName,
} from './symbols.js';

export {
  animations,
  SCRAMBLE_CHARS,
  DEFAULT_SCRAMBLE_CONFIG,
  scrambleText,
  getStaggerDelay,
  type AnimationPreset,
  type ScrambleConfig,
  type EasingFunction,
} from './animations.js';

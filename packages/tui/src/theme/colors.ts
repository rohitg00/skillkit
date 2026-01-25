/**
 * Monochromatic color palette for SkillKit TUI
 * Inspired by OpenSync's elegant dark theme
 */

export const colors = {
  // Base (monochromatic grays)
  background: '#0d0d0d',
  surface: '#1a1a1a',
  surfaceHover: '#262626',
  border: '#333333',
  borderDim: '#1f1f1f',

  // Text hierarchy
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',

  // Accent (single brand color - vibrant green)
  accent: '#00ff88',
  accentDim: '#00cc6a',

  // Status colors (subtle variations)
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // Feature-specific accent colors (for colored keywords)
  sync: '#00d9ff',      // cyan
  browse: '#22c55e',    // green
  recommend: '#fbbf24', // yellow/gold
  translate: '#a855f7', // purple
  workflow: '#3b82f6',  // blue
  team: '#ffffff',      // white
  private: '#ef4444',   // red
  tag: '#fbbf24',       // yellow
  export: '#22c55e',    // green
  delete: '#ef4444',    // red
} as const;

export type ColorName = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorName];

/**
 * Get a color value by name
 */
export function getColor(name: ColorName): ColorValue {
  return colors[name];
}

/**
 * Terminal-safe color names for OpenTUI
 * Maps our design system colors to terminal-compatible values
 */
export const terminalColors = {
  background: 'black',
  surface: 'black',
  text: 'white',
  textSecondary: 'gray',
  textMuted: 'gray',
  accent: 'green',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
  sync: 'cyan',
  browse: 'green',
  recommend: 'yellow',
  translate: 'magenta',
  workflow: 'blue',
  team: 'white',
  border: 'gray',
} as const;

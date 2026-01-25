/**
 * Animation presets for SkillKit TUI
 * Uses OpenTUI's useTimeline for smooth 60fps animations
 */

/**
 * Animation easing functions available in OpenTUI
 */
export type EasingFunction =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart';

/**
 * Animation preset configuration
 */
export interface AnimationPreset {
  duration: number;
  ease: EasingFunction;
  stagger?: number;
}

/**
 * Predefined animation presets
 */
export const animations = {
  /**
   * Staggered fade-in for entrance animations
   * Used on home screen for progressive content reveal
   */
  staggeredFadeIn: {
    duration: 800,
    ease: 'easeOutCubic' as EasingFunction,
    stagger: 100,
  },

  /**
   * Logo reveal with scramble effect
   * Used for branding animation on startup
   */
  logoReveal: {
    duration: 600,
    ease: 'easeOutCubic' as EasingFunction,
  },

  /**
   * Count-up animation for stats
   * Used in StatsCard component
   */
  countUp: {
    duration: 1200,
    ease: 'easeOutQuart' as EasingFunction,
  },

  /**
   * Screen transition animation
   * Used when navigating between screens
   */
  screenTransition: {
    duration: 200,
    ease: 'easeInOutCubic' as EasingFunction,
  },

  /**
   * Quick fade for tooltips and hints
   */
  quickFade: {
    duration: 150,
    ease: 'easeOutQuad' as EasingFunction,
  },

  /**
   * Pulse animation for active states
   */
  pulse: {
    duration: 1000,
    ease: 'easeInOutQuad' as EasingFunction,
  },
} as const;

/**
 * Scramble effect characters
 * Used for text reveal animations
 */
export const SCRAMBLE_CHARS = '█▓▒░◆◇◈⟁◎✦⬡▣';

/**
 * Scramble animation configuration
 */
export interface ScrambleConfig {
  /** Animation duration in ms */
  duration: number;
  /** Progress increment per frame */
  increment: number;
  /** Frame interval in ms */
  interval: number;
}

/**
 * Default scramble animation config
 */
export const DEFAULT_SCRAMBLE_CONFIG: ScrambleConfig = {
  duration: 420,
  increment: 12,
  interval: 35,
};

/**
 * Generate scrambled text with progressive reveal
 * @param target - The target text to reveal
 * @param progress - Progress percentage (0-100)
 * @param chars - Characters to use for scrambling
 */
export function scrambleText(
  target: string,
  progress: number,
  chars: string = SCRAMBLE_CHARS
): string {
  return target
    .split('\n')
    .map((line) => {
      return line
        .split('')
        .map((char, i) => {
          if (char === ' ') return char;
          if (progress > (i / line.length) * 100) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
    })
    .join('\n');
}

/**
 * Calculate staggered delay for an item in a list
 * @param index - Item index
 * @param stagger - Delay between items in ms
 * @returns Delay in ms for this item
 */
export function getStaggerDelay(index: number, stagger: number = 100): number {
  return index * stagger;
}

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

/**
 * New animation presets (Phase 1.4)
 */
export const interactionAnimations = {
  /**
   * Element appearance animation
   */
  fadeIn: {
    duration: 200,
    ease: 'easeOutQuad' as EasingFunction,
  },

  /**
   * Element disappear animation
   */
  fadeOut: {
    duration: 150,
    ease: 'easeInQuad' as EasingFunction,
  },

  /**
   * Detail pane slide in from right
   */
  slideInRight: {
    duration: 250,
    ease: 'easeOutCubic' as EasingFunction,
  },

  /**
   * Detail pane slide out to right
   */
  slideOutRight: {
    duration: 200,
    ease: 'easeInCubic' as EasingFunction,
  },

  /**
   * Hover state transition
   */
  hover: {
    duration: 100,
    ease: 'easeOutQuad' as EasingFunction,
  },

  /**
   * Button press feedback
   */
  press: {
    duration: 50,
    ease: 'easeOutQuad' as EasingFunction,
  },

  /**
   * Typewriter text reveal (per character)
   */
  typewriter: {
    duration: 30,
    ease: 'linear' as EasingFunction,
  },
} as const;

/**
 * Animation timing constants
 */
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 400,
  verySlow: 800,
} as const;

/**
 * Frame rate constants
 */
export const FRAME_RATE = {
  fps60: 1000 / 60,
  fps30: 1000 / 30,
  fps24: 1000 / 24,
} as const;

/**
 * Spinner frame animations
 */
export const SPINNER_FRAMES = {
  braille: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  dots: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  line: ['|', '/', '-', '\\'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  bounce: ['⠁', '⠂', '⠄', '⠂'],
  pulse: ['◐', '◓', '◑', '◒'],
} as const;

/**
 * Progress bar characters
 */
export const PROGRESS_CHARS = {
  filled: '█',
  empty: '░',
  partial: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
} as const;

/**
 * Create a spring animation curve
 */
export function springCurve(
  progress: number,
  tension: number = 0.5,
  friction: number = 0.5
): number {
  const p = progress;
  const oscillation = Math.sin(p * Math.PI * (1 + tension * 4));
  const damping = Math.exp(-p * friction * 6);
  return 1 - damping * oscillation * (1 - p);
}

/**
 * Create a bounce animation curve
 */
export function bounceCurve(progress: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  let p = progress;

  if (p < 1 / d1) {
    return n1 * p * p;
  } else if (p < 2 / d1) {
    return n1 * (p -= 1.5 / d1) * p + 0.75;
  } else if (p < 2.5 / d1) {
    return n1 * (p -= 2.25 / d1) * p + 0.9375;
  } else {
    return n1 * (p -= 2.625 / d1) * p + 0.984375;
  }
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

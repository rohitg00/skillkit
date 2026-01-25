/**
 * Navigation state management for SkillKit TUI
 */
import type { Screen } from './types.js';
import { NAV_KEYS } from './types.js';

/**
 * Navigation state
 */
export interface NavigationState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  history: Screen[];
}

/**
 * Create initial navigation state
 */
export function createNavigationState(): NavigationState {
  return {
    currentScreen: 'home',
    previousScreen: null,
    history: ['home'],
  };
}

/**
 * Navigate to a new screen
 */
export function navigateTo(state: NavigationState, screen: Screen): NavigationState {
  if (state.currentScreen === screen) return state;

  return {
    currentScreen: screen,
    previousScreen: state.currentScreen,
    history: [...state.history, screen],
  };
}

/**
 * Go back to previous screen (or home)
 */
export function goBack(state: NavigationState): NavigationState {
  const previousScreen = state.previousScreen || 'home';
  return {
    currentScreen: previousScreen,
    previousScreen: state.history[state.history.length - 3] || null,
    history: state.history.slice(0, -1),
  };
}

/**
 * Get screen from key press
 */
export function getScreenFromKey(key: string): Screen | undefined {
  return NAV_KEYS[key];
}

/**
 * Check if a key is a navigation key
 */
export function isNavKey(key: string): boolean {
  return key in NAV_KEYS;
}

export { NAV_KEYS };

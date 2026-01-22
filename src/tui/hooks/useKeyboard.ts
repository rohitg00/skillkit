import { useState, useCallback, useEffect } from 'react';
import { useInput, useApp } from 'ink';
import type { Screen } from '../App.js';

interface UseKeyboardOptions {
  onNavigate?: (screen: Screen) => void;
  onSelect?: () => void;
  onSearch?: () => void;
  onInstall?: () => void;
  onBack?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  disabled?: boolean;
}

export function useKeyboard(options: UseKeyboardOptions = {}) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (options.disabled) return;

    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
      return;
    }

    if (key.escape && options.onBack) {
      options.onBack();
      return;
    }

    if (key.return && options.onSelect) {
      options.onSelect();
      return;
    }

    if (key.upArrow && options.onUp) {
      options.onUp();
      return;
    }

    if (key.downArrow && options.onDown) {
      options.onDown();
      return;
    }

    if (input === '/' && options.onSearch) {
      options.onSearch();
      return;
    }

    if (input === 'i' && options.onInstall) {
      options.onInstall();
      return;
    }

    if (input === 'h' && options.onNavigate) {
      options.onNavigate('home');
    } else if (input === 'b' && options.onNavigate) {
      options.onNavigate('browse');
    } else if (input === 'l' && options.onNavigate) {
      options.onNavigate('installed');
    } else if (input === 's' && options.onNavigate) {
      options.onNavigate('sync');
    } else if (input === ',' && options.onNavigate) {
      options.onNavigate('settings');
    }
  });
}

export function useListNavigation(listLength: number, initialIndex = 0) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (selectedIndex >= listLength && listLength > 0) {
      setSelectedIndex(listLength - 1);
    }
  }, [listLength, selectedIndex]);

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(listLength - 1, prev + 1));
  }, [listLength]);

  const reset = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  return { selectedIndex, setSelectedIndex, moveUp, moveDown, reset };
}

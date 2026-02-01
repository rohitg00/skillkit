/**
 * AnimatedText Component
 * Text with fade/slide animations
 */

import { Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { SCRAMBLE_CHARS, scrambleText } from '../theme/animations.js';

interface AnimatedTextProps {
  text: string;
  animation?: 'fadeIn' | 'typewriter' | 'scramble' | 'countUp' | 'none';
  duration?: number;
  delay?: number;
  color?: string;
  onComplete?: () => void;
}

export function AnimatedText(props: AnimatedTextProps) {
  const [progress, setProgress] = createSignal(0);
  const [isComplete, setIsComplete] = createSignal(false);

  const animation = () => props.animation ?? 'fadeIn';
  const duration = () => props.duration ?? 500;
  const delay = () => props.delay ?? 0;
  const color = () => props.color ?? terminalColors.text;

  createEffect(() => {
    if (animation() === 'none') {
      setProgress(100);
      setIsComplete(true);
      return;
    }

    let delayTimeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;
    let startTime: number | undefined;
    let cancelled = false;

    const animate = () => {
      if (cancelled) return;

      const now = Date.now();
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min((elapsed / duration()) * 100, 100);

      setProgress(p);

      if (p < 100) {
        animationTimeoutId = setTimeout(animate, 16);
      } else {
        setIsComplete(true);
        props.onComplete?.();
      }
    };

    if (delay() > 0) {
      delayTimeoutId = setTimeout(() => {
        animationTimeoutId = setTimeout(animate, 16);
      }, delay());
    } else {
      animationTimeoutId = setTimeout(animate, 16);
    }

    onCleanup(() => {
      cancelled = true;
      if (delayTimeoutId) clearTimeout(delayTimeoutId);
      if (animationTimeoutId) clearTimeout(animationTimeoutId);
    });
  });

  const displayText = () => {
    switch (animation()) {
      case 'typewriter': {
        const charCount = Math.floor((progress() / 100) * props.text.length);
        return props.text.slice(0, charCount);
      }
      case 'scramble': {
        return scrambleText(props.text, progress());
      }
      case 'countUp': {
        const num = parseFloat(props.text);
        if (!isNaN(num)) {
          return String(Math.round((progress() / 100) * num));
        }
        return props.text;
      }
      case 'fadeIn':
      case 'none':
      default:
        return props.text;
    }
  };

  return (
    <text fg={color()}>
      {displayText()}
      <Show when={animation() === 'typewriter' && !isComplete()}>
        <text fg={terminalColors.accent}>▌</text>
      </Show>
    </text>
  );
}

interface CountUpTextProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  formatter?: (value: number) => string;
}

export function CountUpText(props: CountUpTextProps) {
  const [displayValue, setDisplayValue] = createSignal(0);
  const duration = () => props.duration ?? 1000;
  const delay = () => props.delay ?? 0;
  const color = () => props.color ?? terminalColors.text;
  const formatter = () => props.formatter ?? ((v: number) => String(Math.round(v)));

  createEffect(() => {
    let delayTimeoutId: ReturnType<typeof setTimeout>;
    let animationTimeoutId: ReturnType<typeof setTimeout>;
    let startTime: number | undefined;
    let cancelled = false;

    const animate = () => {
      if (cancelled) return;

      const now = Date.now();
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration(), 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(eased * props.value);

      if (progress < 1) {
        animationTimeoutId = setTimeout(animate, 16);
      }
    };

    if (delay() > 0) {
      delayTimeoutId = setTimeout(() => {
        animationTimeoutId = setTimeout(animate, 16);
      }, delay());
    } else {
      animationTimeoutId = setTimeout(animate, 16);
    }

    onCleanup(() => {
      cancelled = true;
      if (delayTimeoutId) clearTimeout(delayTimeoutId);
      if (animationTimeoutId) clearTimeout(animationTimeoutId);
    });
  });

  return (
    <text fg={color()}>
      {props.prefix ?? ''}
      {formatter()(displayValue())}
      {props.suffix ?? ''}
    </text>
  );
}

interface BlinkingTextProps {
  text: string;
  interval?: number;
  color?: string;
  blinkColor?: string;
}

export function BlinkingText(props: BlinkingTextProps) {
  const [visible, setVisible] = createSignal(true);
  const interval = () => props.interval ?? 500;
  const color = () => props.color ?? terminalColors.text;
  const blinkColor = () => props.blinkColor ?? terminalColors.textMuted;

  createEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => !v);
    }, interval());

    onCleanup(() => clearInterval(timer));
  });

  return <text fg={visible() ? color() : blinkColor()}>{props.text}</text>;
}

interface PulsingTextProps {
  text: string;
  color?: string;
  pulseColor?: string;
  interval?: number;
}

export function PulsingText(props: PulsingTextProps) {
  const [phase, setPhase] = createSignal(0);
  const interval = () => props.interval ?? 100;
  const color = () => props.color ?? terminalColors.accent;
  const pulseColor = () => props.pulseColor ?? terminalColors.text;

  createEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % 20);
    }, interval());

    onCleanup(() => clearInterval(timer));
  });

  const currentColor = () => {
    const p = phase();
    if (p < 10) return color();
    return pulseColor();
  };

  return <text fg={currentColor()}>{props.text}</text>;
}

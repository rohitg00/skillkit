/**
 * ErrorBoundary Component
 * Catch and display errors gracefully
 */

import { ErrorBoundary as SolidErrorBoundary, type JSX, Show } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { terminalColors } from '../theme/colors.js';

interface ErrorBoundaryProps {
  children: JSX.Element;
  fallback?: JSX.Element | ((error: Error, reset: () => void) => JSX.Element);
  onError?: (error: Error) => void;
}

function DefaultErrorFallback(props: { error: Error; reset: () => void }) {
  const errorMessage = () => {
    if (props.error instanceof Error) {
      return props.error.message;
    }
    return String(props.error);
  };

  const errorStack = () => {
    if (props.error instanceof Error && props.error.stack) {
      const lines = props.error.stack.split('\n').slice(1, 4);
      return lines.join('\n');
    }
    return '';
  };

  useKeyboard((key) => {
    if (key.name === 'r') {
      props.reset();
    }
  });

  return (
    <box flexDirection="column" paddingY={2} paddingX={1}>
      <box flexDirection="row" marginBottom={1}>
        <text fg={terminalColors.error}>✗ Something went wrong</text>
      </box>

      <box
        flexDirection="column"
        borderStyle="round"
        borderColor={terminalColors.error}
        paddingX={1}
        paddingY={1}
      >
        <text fg={terminalColors.text}>{errorMessage()}</text>

        <Show when={errorStack()}>
          <box marginTop={1}>
            <text fg={terminalColors.textMuted}>
              {errorStack()}
            </text>
          </box>
        </Show>
      </box>

      <box marginTop={1}>
        <text fg={terminalColors.textMuted}>
          Press <text fg={terminalColors.accent}>r</text> to retry or{' '}
          <text fg={terminalColors.accent}>Esc</text> to go back
        </text>
      </box>
    </box>
  );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  let handledErrorRef: Error | null = null;

  const fallbackComponent = (error: Error, reset: () => void) => {
    if (props.onError && handledErrorRef !== error) {
      handledErrorRef = error;
      props.onError(error);
    }

    const wrappedReset = () => {
      handledErrorRef = null;
      reset();
    };

    if (typeof props.fallback === 'function') {
      return props.fallback(error, wrappedReset);
    }

    if (props.fallback) {
      return props.fallback;
    }

    return <DefaultErrorFallback error={error} reset={wrappedReset} />;
  };

  return (
    <SolidErrorBoundary fallback={fallbackComponent}>
      {props.children}
    </SolidErrorBoundary>
  );
}

interface TryProps {
  children: JSX.Element;
  catch?: JSX.Element;
}

export function Try(props: TryProps) {
  return (
    <ErrorBoundary
      fallback={
        props.catch ?? (
          <text fg={terminalColors.error}>Error loading component</text>
        )
      }
    >
      {props.children}
    </ErrorBoundary>
  );
}

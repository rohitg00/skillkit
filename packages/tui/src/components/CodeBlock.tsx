/**
 * CodeBlock Component
 * Basic syntax highlighting for code display
 */

import { For, Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxLines?: number;
  highlightLines?: number[];
  title?: string;
}

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'import',
  'export',
  'from',
  'class',
  'extends',
  'async',
  'await',
  'try',
  'catch',
  'throw',
  'new',
  'this',
  'true',
  'false',
  'null',
  'undefined',
  'type',
  'interface',
]);

function tokenizeLine(line: string): Array<{ type: string; value: string }> {
  const tokens: Array<{ type: string; value: string }> = [];
  let remaining = line;

  while (remaining.length > 0) {
    if (remaining.startsWith('//')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }

    const stringMatch = remaining.match(/^(['"`])(?:\\.|[^\\])*?\1/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const numberMatch = remaining.match(/^\d+\.?\d*/);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const type = KEYWORDS.has(word) ? 'keyword' : 'identifier';
      tokens.push({ type, value: word });
      remaining = remaining.slice(word.length);
      continue;
    }

    const spaceMatch = remaining.match(/^\s+/);
    if (spaceMatch) {
      tokens.push({ type: 'space', value: spaceMatch[0] });
      remaining = remaining.slice(spaceMatch[0].length);
      continue;
    }

    tokens.push({ type: 'punctuation', value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

function getTokenColor(type: string): string {
  switch (type) {
    case 'keyword':
      return terminalColors.accent;
    case 'string':
      return terminalColors.warning;
    case 'number':
      return terminalColors.info;
    case 'comment':
      return terminalColors.textMuted;
    default:
      return terminalColors.text;
  }
}

export function CodeBlock(props: CodeBlockProps) {
  const showLineNumbers = () => props.showLineNumbers ?? true;
  const highlightLines = () => new Set(props.highlightLines ?? []);

  const lines = () => {
    const allLines = props.code.split('\n');
    if (props.maxLines && allLines.length > props.maxLines) {
      return allLines.slice(0, props.maxLines);
    }
    return allLines;
  };

  const lineNumberWidth = () => String(lines().length).length + 1;

  const isTruncated = () => {
    const allLines = props.code.split('\n');
    return props.maxLines !== undefined && allLines.length > props.maxLines;
  };

  return (
    <box flexDirection="column">
      <Show when={props.title}>
        <box marginBottom={1}>
          <text fg={terminalColors.textMuted}>
            {props.title}
          </text>
        </box>
      </Show>

      <box
        flexDirection="column"
        borderStyle="round"
        borderColor={terminalColors.border}
        paddingX={1}
      >
        <For each={lines()}>
          {(line, index) => {
            const lineNum = index() + 1;
            const isHighlighted = highlightLines().has(lineNum);
            const tokens = tokenizeLine(line);

            return (
              <box flexDirection="row">
                <Show when={showLineNumbers()}>
                  <text
                    fg={isHighlighted ? terminalColors.accent : terminalColors.textMuted}
                    width={lineNumberWidth()}
                  >
                    {isHighlighted ? '▸' : ' '}
                    {String(lineNum).padStart(lineNumberWidth() - 1, ' ')}{' '}
                  </text>
                </Show>
                <For each={tokens}>
                  {(token) => (
                    <text fg={isHighlighted ? terminalColors.accent : getTokenColor(token.type)}>
                      {token.value}
                    </text>
                  )}
                </For>
              </box>
            );
          }}
        </For>

        <Show when={isTruncated()}>
          <text fg={terminalColors.textMuted}>
            ... {props.code.split('\n').length - (props.maxLines ?? 0)} more lines
          </text>
        </Show>
      </box>
    </box>
  );
}

interface InlineCodeProps {
  children: string;
}

export function InlineCode(props: InlineCodeProps) {
  return (
    <text fg={terminalColors.accent}>
      `{props.children}`
    </text>
  );
}

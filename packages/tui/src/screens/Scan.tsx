import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { EmptyState } from '../components/EmptyState.js';
import { execFile } from 'node:child_process';

interface ScanProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface ScanFinding {
  ruleId: string;
  severity: string;
  title: string;
  filePath?: string;
  lineNumber?: number;
  snippet?: string;
  remediation?: string;
}

interface ScanResult {
  skillPath: string;
  skillName: string;
  verdict: 'pass' | 'warn' | 'fail';
  findings: ScanFinding[];
  stats: { critical: number; high: number; medium: number; low: number; info: number };
  duration: number;
  analyzersUsed: string[];
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '#ff5555';
    case 'high': return '#ff4444';
    case 'medium': return '#ffaa00';
    case 'low': return '#00bbcc';
    case 'info': return '#888888';
    default: return terminalColors.textMuted;
  }
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'pass': return '#22cc44';
    case 'warn': return '#ffaa00';
    case 'fail': return '#ff5555';
    default: return terminalColors.textMuted;
  }
}

export function Scan(props: ScanProps) {
  const [scanning, setScanning] = createSignal(false);
  const [result, setResult] = createSignal<ScanResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [scanPath] = createSignal('.');
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const rows = () => props.rows ?? 24;
  const visibleCount = () => Math.max(1, rows() - 14);

  const runScan = (path: string) => {
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      execFile('npx', ['skillkit', 'scan', path, '--format', 'json'], {
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      }, (err, stdout, stderr) => {
        setScanning(false);
        if (err && !stdout) {
          setError(stderr || err.message || 'Scan failed');
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as ScanResult;
          setResult(parsed);
        } catch {
          setError('Failed to parse scan results');
        }
      });
    } catch (err) {
      setScanning(false);
      setError(err instanceof Error ? err.message : 'Failed to start scan');
    }
  };

  createEffect(() => {
    runScan(scanPath());
  });

  const findings = createMemo(() => result()?.findings ?? []);
  const windowStart = createMemo(() => Math.max(0, selectedIndex() - visibleCount() + 1));
  const visibleFindings = createMemo(() =>
    findings().slice(windowStart(), windowStart() + visibleCount())
  );

  useKeyboard((key: { name?: string; sequence?: string }) => {
    if (key.name === 'k' || key.name === 'up') {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.name === 'j' || key.name === 'down') {
      setSelectedIndex(i => Math.min(findings().length - 1, i + 1));
    } else if (key.name === 'r') {
      runScan(scanPath());
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <Header
        title="Security Scan"
        subtitle="detect vulnerabilities in skills"
        icon="\u25D0"
      />

      <Show when={scanning()}>
        <box flexDirection="row" gap={1}>
          <Spinner />
          <text fg={terminalColors.textMuted}>Scanning {scanPath()}...</text>
        </box>
      </Show>

      <Show when={error()}>
        <box flexDirection="column">
          <text fg="#ff5555">Scan error: {error()}</text>
          <text fg={terminalColors.textMuted}>Press r to retry</text>
        </box>
      </Show>

      <Show when={result() && !scanning()}>
        <box flexDirection="column">
          <box flexDirection="row" gap={2}>
            <text fg={terminalColors.text}>
              {result()!.skillName}
            </text>
            <text fg={getVerdictColor(result()!.verdict)}>
              {result()!.verdict.toUpperCase()}
            </text>
            <text fg={terminalColors.textMuted}>
              {result()!.duration}ms
            </text>
          </box>

          <box flexDirection="row" gap={2}>
            <Show when={result()!.stats.critical > 0}>
              <text fg="#ff5555">{result()!.stats.critical} critical</text>
            </Show>
            <Show when={result()!.stats.high > 0}>
              <text fg="#ff4444">{result()!.stats.high} high</text>
            </Show>
            <Show when={result()!.stats.medium > 0}>
              <text fg="#ffaa00">{result()!.stats.medium} medium</text>
            </Show>
            <Show when={result()!.stats.low > 0}>
              <text fg="#00bbcc">{result()!.stats.low} low</text>
            </Show>
            <Show when={result()!.stats.info > 0}>
              <text fg="#888888">{result()!.stats.info} info</text>
            </Show>
            <Show when={findings().length === 0}>
              <text fg="#22cc44">No findings</text>
            </Show>
          </box>

          <text fg={terminalColors.textMuted}>{'─'.repeat(Math.min(60, (props.cols ?? 80) - 4))}</text>

          <Show when={findings().length === 0}>
            <EmptyState title="No security findings detected" />
          </Show>

          <Show when={findings().length > 0}>
            <For each={visibleFindings()}>
              {(finding, idx) => {
                const absoluteIdx = () => windowStart() + idx();
                const isSelected = () => absoluteIdx() === selectedIndex();
                return (
                  <box flexDirection="column">
                    <box flexDirection="row" gap={1}>
                      <text fg={isSelected() ? terminalColors.accent : terminalColors.textMuted}>
                        {isSelected() ? '>' : ' '}
                      </text>
                      <text fg={getSeverityColor(finding.severity)}>
                        {finding.severity.toUpperCase().padEnd(8)}
                      </text>
                      <text fg={terminalColors.textMuted}>[{finding.ruleId}]</text>
                      <text fg={isSelected() ? terminalColors.text : terminalColors.textMuted}>
                        {finding.title}
                      </text>
                    </box>
                    <Show when={isSelected() && finding.filePath}>
                      <text fg={terminalColors.textMuted}>
                        {'           '}{finding.filePath}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
                      </text>
                    </Show>
                    <Show when={isSelected() && finding.remediation}>
                      <text fg={terminalColors.accent}>
                        {'           '}Fix: {finding.remediation}
                      </text>
                    </Show>
                  </box>
                );
              }}
            </For>
          </Show>
        </box>
      </Show>

      <text> </text>
      <text fg={terminalColors.textMuted}>j/k navigate  r rescan  esc back</text>
    </box>
  );
}

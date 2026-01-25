/**
 * Plan Screen
 * Structured plan execution
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { ProgressBar } from '../components/ProgressBar.js';

interface PlanProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Plan({ onNavigate, cols = 80, rows = 24 }: PlanProps) {
  const steps = [
    { name: 'Analyze codebase', status: 'done', duration: '2.3s' },
    { name: 'Generate tests', status: 'done', duration: '5.1s' },
    { name: 'Run linter', status: 'running', duration: '-' },
    { name: 'Apply fixes', status: 'pending', duration: '-' },
    { name: 'Verify changes', status: 'pending', duration: '-' },
  ];

  const completedSteps = steps.filter((s) => s.status === 'done').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Plan Execution"
        subtitle="Structured multi-step execution"
        icon="&#x25A3;"
      />

      <box flexDirection="row" marginBottom={1}>
        <text fg={terminalColors.text}>Progress: </text>
        <ProgressBar progress={progress} width={30} />
      </box>

      <text fg={terminalColors.text}><b>Steps</b></text>
      <text> </text>

      {steps.map((step, idx) => {
        const statusIcon = step.status === 'done' ? '\u2713' : step.status === 'running' ? '\u27F3' : '\u25CB';
        const statusColor =
          step.status === 'done'
            ? terminalColors.success
            : step.status === 'running'
            ? terminalColors.accent
            : terminalColors.textMuted;

        return (
          <box key={step.name} flexDirection="row" marginBottom={1}>
            <text fg={statusColor} width={3}>{statusIcon}</text>
            <text fg={step.status === 'pending' ? terminalColors.textMuted : terminalColors.text} width={25}>
              {step.name}
            </text>
            <text fg={terminalColors.textMuted}>{step.duration}</text>
          </box>
        );
      })}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press Enter to continue, Esc to cancel
      </text>
    </box>
  );
}

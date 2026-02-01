import { For } from 'solid-js';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface HistoryProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function History(props: HistoryProps) {
  const history = [
    { skill: 'tdd-workflow', time: '10:32 AM', duration: '2.3s', status: 'success' },
    { skill: 'code-review', time: '10:15 AM', duration: '5.1s', status: 'success' },
    { skill: 'deploy-check', time: '09:45 AM', duration: '8.7s', status: 'failed' },
    { skill: 'lint-fix', time: '09:30 AM', duration: '1.2s', status: 'success' },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="History"
        subtitle="View execution history"
        count={history.length}
        icon="&#x25F7;"
      />

      <text fg={terminalColors.text}><b>Recent Executions</b></text>
      <text> </text>

      <For each={history}>
        {(item, idx) => (
          <box flexDirection="row" marginBottom={1}>
            <text
              fg={idx() === 0 ? terminalColors.accent : terminalColors.text}
              width={18}
            >
              {idx() === 0 ? '\u25B8 ' : '  '}{item.skill}
            </text>
            <text fg={terminalColors.textMuted} width={12}>{item.time}</text>
            <text fg={terminalColors.textMuted} width={10}>{item.duration}</text>
            <text
              fg={item.status === 'success' ? terminalColors.success : terminalColors.error}
            >
              {item.status === 'success' ? '\u2713 success' : '\u2717 failed'}
            </text>
          </box>
        )}
      </For>

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press Enter to view details, 'r' to re-run, 'c' to clear
      </text>
    </box>
  );
}

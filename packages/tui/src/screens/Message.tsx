import { For } from 'solid-js';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface MessageProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Message(props: MessageProps) {
  const messages = [
    { id: '1', from: 'claude@laptop', subject: 'Code review completed', time: '2 min ago', unread: true },
    { id: '2', from: 'cursor@workstation', subject: 'Build artifacts ready', time: '15 min ago', unread: true },
    { id: '3', from: 'codex@server', subject: 'Test results', time: '1 hour ago', unread: false },
  ];

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Messages"
        subtitle="Inter-agent communication"
        count={unreadCount}
        icon="&#x2709;"
      />

      <box flexDirection="row" marginBottom={1}>
        <text fg={terminalColors.text}><b>Inbox</b></text>
        <text fg={terminalColors.textMuted}>  {unreadCount} unread</text>
      </box>

      <text> </text>

      <For each={messages}>
        {(msg, idx) => (
          <box flexDirection="row" marginBottom={1}>
            <text fg={msg.unread ? terminalColors.accent : terminalColors.textMuted} width={3}>
              {msg.unread ? '*' : 'o'}
            </text>
            <text fg={idx() === 0 ? terminalColors.accent : terminalColors.text} width={22}>
              {idx() === 0 ? '\u25B8 ' : '  '}{msg.from}
            </text>
            <text fg={msg.unread ? terminalColors.text : terminalColors.textMuted} width={30}>
              {msg.subject.slice(0, 28)}
            </text>
            <text fg={terminalColors.textMuted}>{msg.time}</text>
          </box>
        )}
      </For>

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Enter to read  'n' new message  'r' reply  'a' archive  's' sent
      </text>
    </box>
  );
}

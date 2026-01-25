/**
 * Team Screen
 * Team collaboration
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface TeamProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Team({ onNavigate, cols = 80, rows = 24 }: TeamProps) {
  const members = [
    { name: 'You', role: 'Owner', status: 'online', skills: 12 },
    { name: 'Alice', role: 'Admin', status: 'online', skills: 8 },
    { name: 'Bob', role: 'Member', status: 'offline', skills: 5 },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Team"
        subtitle="Collaborate with your development team"
        count={members.length}
        icon="&#x25C9;"
      />

      <text fg={terminalColors.text}><b>Team Members</b></text>
      <text> </text>

      {members.map((member, idx) => (
        <box key={member.name} flexDirection="row" marginBottom={1}>
          <text
            fg={idx === 0 ? terminalColors.accent : terminalColors.text}
            width={15}
          >
            {idx === 0 ? '\u25B8 ' : '  '}{member.name}
          </text>
          <text fg={terminalColors.textMuted} width={10}>{member.role}</text>
          <text
            fg={member.status === 'online' ? terminalColors.success : terminalColors.textMuted}
            width={10}
          >
            {member.status === 'online' ? '\u25CF online' : '\u25CB offline'}
          </text>
          <text fg={terminalColors.textMuted}>{member.skills} skills</text>
        </box>
      ))}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press 'i' to invite, 's' to share skills
      </text>
    </box>
  );
}

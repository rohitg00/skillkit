/**
 * Methodology Screen
 * Development methodology packs
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface MethodologyProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Methodology({ onNavigate, cols = 80, rows = 24 }: MethodologyProps) {
  const methodologies = [
    { name: 'TDD', description: 'Test-Driven Development', skills: 5, active: true },
    { name: 'BDD', description: 'Behavior-Driven Development', skills: 4, active: false },
    { name: 'Clean Code', description: 'SOLID principles', skills: 6, active: false },
    { name: 'Security First', description: 'OWASP guidelines', skills: 8, active: false },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Methodologies"
        subtitle="Development methodology skill packs"
        count={methodologies.length}
        icon="&#x25CE;"
      />

      <text fg={terminalColors.text}><b>Available Packs</b></text>
      <text> </text>

      {methodologies.map((meth, idx) => (
        <box key={meth.name} flexDirection="column" marginBottom={1}>
          <box flexDirection="row">
            <text
              fg={idx === 0 ? terminalColors.accent : terminalColors.text}
              width={15}
            >
              {idx === 0 ? <b>{'\u25B8 '}{meth.name}</b> : <>{'\u25B8 '}{meth.name}</>}
            </text>
            <text fg={terminalColors.textMuted}>{meth.skills} skills</text>
            {meth.active && (
              <text fg={terminalColors.success}> [active]</text>
            )}
          </box>
          <text fg={terminalColors.textMuted}>    {meth.description}</text>
        </box>
      ))}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press Enter to activate, 'v' to view skills
      </text>
    </box>
  );
}

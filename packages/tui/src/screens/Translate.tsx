/**
 * Translate Screen
 * Skill format conversion with diff view
 */
import { useState } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { AGENT_LOGOS } from '../theme/symbols.js';
import { Header } from '../components/Header.js';

interface TranslateProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Translate(_props: TranslateProps) {
  const [sourceAgent] = useState('claude-code');
  const [targetAgent] = useState('cursor');

  const sourceInfo = AGENT_LOGOS[sourceAgent];
  const targetInfo = AGENT_LOGOS[targetAgent];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Translate Skills"
        subtitle="Convert skills between agent formats"
        icon="&#x21C4;"
      />

      <box flexDirection="row" marginTop={1} marginBottom={1}>
        <box flexDirection="column" width={25}>
          <text fg={terminalColors.textMuted}>Source Agent</text>
          <text fg={terminalColors.accent}>
            <b>{sourceInfo?.icon} {sourceInfo?.name}</b>
          </text>
        </box>
        <text fg={terminalColors.textMuted}> &#x2192; </text>
        <box flexDirection="column" width={25}>
          <text fg={terminalColors.textMuted}>Target Agent</text>
          <text fg={terminalColors.text}>
            <b>{targetInfo?.icon} {targetInfo?.name}</b>
          </text>
        </box>
      </box>

      <text fg={terminalColors.textMuted}>
        {'\u2500'.repeat(50)}
      </text>
      <text> </text>

      <text fg={terminalColors.text}><b>Select a skill to translate:</b></text>
      <text> </text>
      <text fg={terminalColors.textMuted}>
        No skills selected. Press 'i' to view installed skills.
      </text>
      <text> </text>
      <text fg={terminalColors.textMuted}>
        Use Tab to switch agents, Enter to translate
      </text>
    </box>
  );
}

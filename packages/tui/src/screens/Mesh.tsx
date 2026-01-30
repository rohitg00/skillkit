/**
 * Mesh Screen
 * Mesh network and peer management
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface MeshProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Mesh({ onNavigate, cols = 80, rows = 24 }: MeshProps) {
  const hosts = [
    { name: 'workstation-1', address: '192.168.1.10', status: 'online', peers: 3 },
    { name: 'laptop-dev', address: '192.168.1.15', status: 'online', peers: 2 },
    { name: 'server-main', address: '192.168.1.100', status: 'offline', peers: 0 },
  ];

  const securityStatus = {
    initialized: true,
    fingerprint: 'abc123def456',
    trustedPeers: 5,
  };

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Mesh Network"
        subtitle="Multi-machine agent distribution"
        count={hosts.filter(h => h.status === 'online').length}
        icon="&#x25C9;"
      />

      <box flexDirection="row" marginBottom={1}>
        <text fg={terminalColors.text}><b>Security: </b></text>
        <text fg={securityStatus.initialized ? terminalColors.success : terminalColors.warning}>
          {securityStatus.initialized ? '● Initialized' : '○ Not initialized'}
        </text>
        <text fg={terminalColors.textMuted}>  Fingerprint: {securityStatus.fingerprint}</text>
      </box>

      <text fg={terminalColors.text}><b>Known Hosts</b></text>
      <text> </text>

      {hosts.map((host, idx) => (
        <box key={host.name} flexDirection="row" marginBottom={1}>
          <text fg={host.status === 'online' ? terminalColors.success : terminalColors.textMuted} width={3}>
            {host.status === 'online' ? '●' : '○'}
          </text>
          <text fg={idx === 0 ? terminalColors.accent : terminalColors.text} width={20}>
            {idx === 0 ? '\u25B8 ' : '  '}{host.name}
          </text>
          <text fg={terminalColors.textMuted} width={18}>{host.address}</text>
          <text fg={terminalColors.textMuted}>{host.peers} peers</text>
        </box>
      ))}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        'd' discover  'a' add host  'r' remove  's' security  'h' health check
      </text>
    </box>
  );
}

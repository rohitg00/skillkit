import { For } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface Feature {
  key: string;
  label: string;
  description: string;
  color: keyof typeof terminalColors;
}

const FEATURES: Feature[] = [
  { key: 'sync', label: 'Sync', color: 'sync', description: 'share skills across all your coding agents' },
  { key: 'browse', label: 'Browse', color: 'browse', description: 'discover skills from the marketplace' },
  { key: 'recommend', label: 'Recommend', color: 'recommend', description: 'AI-powered skill suggestions for your project' },
  { key: 'translate', label: 'Translate', color: 'translate', description: 'convert skills between agent formats' },
  { key: 'workflow', label: 'Workflow', color: 'workflow', description: 'automate skill execution chains' },
  { key: 'team', label: 'Team', color: 'team', description: 'collaborate with your development team' },
];

interface FeatureListProps {
  features?: Feature[];
}

export function FeatureList(props: FeatureListProps) {
  const features = () => props.features ?? FEATURES;

  return (
    <box flexDirection="column">
      <text fg={terminalColors.text}>
        <b>Features</b>
      </text>
      <text> </text>
      <For each={features()}>
        {(feat) => (
          <box flexDirection="row">
            <text fg={terminalColors[feat.color]}>
              <b>{'  '}{feat.label.padEnd(12)}</b>
            </text>
            <text fg={terminalColors.textMuted}>{feat.description}</text>
          </box>
        )}
      </For>
    </box>
  );
}

export { FEATURES, type Feature };

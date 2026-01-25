/**
 * Recommend Screen - AI Skill Suggestions
 * Clean monochromatic design with colored confidence indicators
 */
import { useState, useEffect, useMemo } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface RecommendProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

// Spinner frames
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Recommend({ onNavigate, cols = 80, rows = 24 }: RecommendProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(true);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const isCompact = cols < 60;
  const isNarrow = cols < 45;
  const contentWidth = Math.min(cols - 4, 60);

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 3) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  // Spinner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Simulate analysis
  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 100) {
          setAnalyzing(false);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [analyzing]);

  // Recommendations data
  const recommendations = useMemo(() => [
    { name: 'tdd-workflow', reason: 'Based on your test files and coverage patterns', confidence: 95 },
    { name: 'react-patterns', reason: 'Detected React in package.json with hooks usage', confidence: 88 },
    { name: 'typescript-strict', reason: 'tsconfig.json found with strict mode disabled', confidence: 82 },
    { name: 'git-workflow', reason: '.git directory with complex branching detected', confidence: 75 },
    { name: 'api-design', reason: 'REST endpoints found in your codebase', confidence: 68 },
    { name: 'docker-compose', reason: 'docker-compose.yml detected for orchestration', confidence: 62 },
  ], []);

  // Calculate visible recommendations
  const maxVisible = Math.max(3, Math.floor((rows - 10) / 2));
  const visibleRecs = recommendations.slice(0, maxVisible);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  // Confidence color
  const getConfColor = (conf: number) => {
    if (conf >= 80) return terminalColors.success;
    if (conf >= 60) return terminalColors.recommend;
    return terminalColors.textMuted;
  };

  const shortcuts = isCompact
    ? 'j/k nav   enter install   r refresh   esc back'
    : 'j/k navigate   enter install   r refresh   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.recommend}>◎ Recommendations</text>
            <text fg={terminalColors.textMuted}>
              {analyzing ? 'analyzing...' : `${recommendations.length} found`}
            </text>
          </box>
          <text fg={terminalColors.textMuted}>AI skill suggestions</text>
          <text> </text>
        </box>
      )}

      {/* Analysis progress */}
      {animPhase >= 2 && analyzing && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.accent}>{SPINNER[spinnerFrame]} </text>
            <text fg={terminalColors.text}>Analyzing</text>
            <text fg={terminalColors.textMuted}> your project...</text>
          </box>
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Results summary */}
      {animPhase >= 2 && !analyzing && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.success}>✓ </text>
            <text fg={terminalColors.text}>Analysis complete</text>
            <text fg={terminalColors.textMuted}> · found {recommendations.length} matching skills</text>
          </box>
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Recommendations list */}
      {animPhase >= 3 && !analyzing && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Suggested Skills</text>
          <text> </text>

          {visibleRecs.map((rec, idx) => {
            const selected = idx === selectedIndex;
            const indicator = selected ? '▸' : ' ';
            return (
              <box key={rec.name} flexDirection="column">
                <box flexDirection="row">
                  <text fg={terminalColors.text}>{indicator}</text>
                  <text fg={selected ? terminalColors.accent : terminalColors.text}>
                    {rec.name}
                  </text>
                  <text fg={getConfColor(rec.confidence)}> {rec.confidence}%</text>
                </box>
                <text fg={terminalColors.textMuted}>  {rec.reason}</text>
                <text> </text>
              </box>
            );
          })}

          {recommendations.length > maxVisible && (
            <text fg={terminalColors.textMuted}>
              +{recommendations.length - maxVisible} more
            </text>
          )}
          <text> </text>
        </box>
      )}

      {/* Footer */}
      {animPhase >= 3 && (
        <box flexDirection="column">
          {divider}
          <text fg={terminalColors.textMuted}>{shortcuts}</text>
        </box>
      )}
    </box>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyboard } from '@opentui/react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface RecommendProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Recommend({ onNavigate, cols = 80, rows = 24 }: RecommendProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(true);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.max(1, Math.min(cols - 4, 60));

  useEffect(() => {
    if (animPhase >= 3) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, [analyzing]);

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

  // Recommendations data (with quality scores)
  const recommendations = useMemo(() => [
    { name: 'tdd-workflow', reason: 'Based on your test files and coverage patterns', confidence: 95, quality: 92, grade: 'A' },
    { name: 'react-patterns', reason: 'Detected React in package.json with hooks usage', confidence: 88, quality: 85, grade: 'B' },
    { name: 'typescript-strict', reason: 'tsconfig.json found with strict mode disabled', confidence: 82, quality: 78, grade: 'C' },
    { name: 'git-workflow', reason: '.git directory with complex branching detected', confidence: 75, quality: 82, grade: 'B' },
    { name: 'api-design', reason: 'REST endpoints found in your codebase', confidence: 68, quality: 71, grade: 'C' },
    { name: 'docker-compose', reason: 'docker-compose.yml detected for orchestration', confidence: 62, quality: 65, grade: 'D' },
  ], []);

  const maxVisible = Math.max(3, Math.floor((rows - 10) / 2));
  const visibleRecs = recommendations.slice(0, maxVisible);

  const handleKeyNav = useCallback((delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, visibleRecs.length - 1)));
  }, [visibleRecs.length]);

  const handleRefresh = useCallback(() => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    setSelectedIndex(0);
  }, []);

  const handleInstall = useCallback(() => {
    if (analyzing) return;
    const rec = visibleRecs[selectedIndex];
    if (rec) {
      // Navigate to installed after "installing"
      onNavigate('installed');
    }
  }, [analyzing, selectedIndex, visibleRecs, onNavigate]);

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleInstall();
    else if (key.name === 'r') handleRefresh();
    else if (key.name === 'escape') onNavigate('home');
  });

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
            const qualityColor = rec.quality >= 80 ? terminalColors.success : rec.quality >= 60 ? terminalColors.warning : terminalColors.error;
            return (
              <box key={rec.name} flexDirection="column">
                <box flexDirection="row">
                  <text fg={terminalColors.text}>{indicator}</text>
                  <text fg={selected ? terminalColors.accent : terminalColors.text}>
                    {rec.name}
                  </text>
                  <text fg={getConfColor(rec.confidence)}> {rec.confidence}%</text>
                  <text fg={qualityColor}> [{rec.grade}]</text>
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

import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { createSessionManager, type SessionState, type CurrentExecution } from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

export function Execute({ rows = 24 }: Props) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  const maxVisible = Math.max(5, rows - 10);

  useEffect(() => {
    loadSession();
    // Poll for updates
    const interval = setInterval(loadSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSession = () => {
    try {
      const manager = createSessionManager(process.cwd());
      const state = manager.get();
      setSession(state);
    } catch {
      setSession(null);
    }
    setLoading(false);
  };

  useInput((input, _key) => {
    if (input === 'r') loadSession();
    else if (input === 'p' && session?.currentExecution?.status === 'running') {
      const manager = createSessionManager(process.cwd());
      manager.pause();
      loadSession();
    }
    else if (input === 'c' && session?.currentExecution?.status === 'paused') {
      const manager = createSessionManager(process.cwd());
      manager.resume();
      loadSession();
    }
  });

  const renderExecution = (exec: CurrentExecution) => {
    const completedTasks = exec.tasks.filter(t => t.status === 'completed').length;
    const failedTasks = exec.tasks.filter(t => t.status === 'failed').length;
    const progress = exec.totalSteps > 0 ? Math.round((completedTasks / exec.totalSteps) * 100) : 0;

    const statusColor = exec.status === 'running' ? 'yellow' :
                       exec.status === 'completed' ? 'green' :
                       exec.status === 'paused' ? 'blue' :
                       exec.status === 'failed' ? 'red' : 'white';

    const visibleTasks = exec.tasks.slice(0, maxVisible);

    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold>{exec.skillName}</Text>
        <Text>Source: <Text dimColor>{exec.skillSource}</Text></Text>
        <Text>Status: <Text color={statusColor}>{exec.status.toUpperCase()}</Text></Text>
        <Text>Progress: {completedTasks}/{exec.totalSteps} ({progress}%)</Text>

        {/* Progress bar */}
        <Box marginY={1}>
          <Text>[</Text>
          <Text color="green">{'█'.repeat(Math.floor(progress / 5))}</Text>
          <Text dimColor>{'░'.repeat(20 - Math.floor(progress / 5))}</Text>
          <Text>]</Text>
        </Box>

        {/* Task list */}
        <Text bold>Tasks:</Text>
        {visibleTasks.map((task, i) => {
          const icon = task.status === 'completed' ? symbols.success :
                      task.status === 'failed' ? symbols.error :
                      task.status === 'in_progress' ? symbols.warning :
                      task.status === 'paused' ? symbols.info :
                      symbols.bullet;
          const color = task.status === 'completed' ? 'green' :
                       task.status === 'failed' ? 'red' :
                       task.status === 'in_progress' ? 'yellow' :
                       task.status === 'paused' ? 'blue' : 'white';
          return (
            <Text key={task.id || i} color={color}>
              {icon} {task.name} {task.error && <Text dimColor>({task.error})</Text>}
            </Text>
          );
        })}
        {exec.tasks.length > maxVisible && (
          <Text dimColor>  ... and {exec.tasks.length - maxVisible} more</Text>
        )}

        {failedTasks > 0 && (
          <Box marginTop={1}>
            <Text color="red">{failedTasks} task(s) failed</Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>EXECUTION MONITOR</Text>

      {loading && <Text>Loading session...</Text>}

      {!loading && !session?.currentExecution && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>No active execution.</Text>
          <Text dimColor>Run a skill with: skillkit run {'<skill>'}</Text>
        </Box>
      )}

      {!loading && session?.currentExecution && renderExecution(session.currentExecution)}

      <Box marginTop={1}>
        <Text dimColor>
          {session?.currentExecution?.status === 'running' ? 'p=pause  ' : ''}
          {session?.currentExecution?.status === 'paused' ? 'c=continue  ' : ''}
          r=refresh  q=quit
        </Text>
      </Box>
    </Box>
  );
}

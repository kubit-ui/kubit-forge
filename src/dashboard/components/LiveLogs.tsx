/**
 * Live Logs Component
 * Real-time log streaming
 */

import { Box, Text } from 'ink';
import React, { useState, useEffect } from 'react';

import type { PluginContext } from '../../types/index.js';

export interface LiveLogsProps {
  ctx: PluginContext;
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export const LiveLogs: React.FC<LiveLogsProps> = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    // Simulate log streaming
    const interval = setInterval(() => {
      const messages = [
        { level: 'info' as const, message: 'Processing file...' },
        { level: 'success' as const, message: 'Build completed' },
        { level: 'warn' as const, message: 'Deprecated API usage detected' },
        { level: 'info' as const, message: 'Running tests...' },
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      setLogs((prev) => [
        ...prev.slice(-19), // Keep last 20 logs
        {
          timestamp: new Date(),
          ...randomMessage,
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'cyan';
      case 'warn':
        return 'yellow';
      case 'error':
        return 'red';
      case 'success':
        return 'green';
      default:
        return 'white';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'ℹ';
      case 'warn':
        return '⚠';
      case 'error':
        return '✗';
      case 'success':
        return '✓';
      default:
        return '•';
    }
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Box justifyContent="space-between">
            <Text color="cyan" bold>
              📋 Live Logs
            </Text>
            <Box>
              <Text dimColor>Status: </Text>
              <Text color={isPaused ? 'yellow' : 'green'}>{isPaused ? 'Paused' : 'Streaming'}</Text>
            </Box>
          </Box>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box marginTop={1} flexDirection="column" height={15}>
            {logs.length === 0 ? (
              <Text dimColor>Waiting for logs...</Text>
            ) : (
              logs.map((log, i) => (
                <Box key={i}>
                  <Text dimColor>[{log.timestamp.toLocaleTimeString()}]</Text>
                  <Text color={getLevelColor(log.level)}> {getLevelIcon(log.level)}</Text>
                  <Text> {log.message}</Text>
                </Box>
              ))
            )}
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Press </Text>
            <Text color="cyan">p</Text>
            <Text dimColor> to pause/resume | </Text>
            <Text color="cyan">c</Text>
            <Text dimColor> to clear logs</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

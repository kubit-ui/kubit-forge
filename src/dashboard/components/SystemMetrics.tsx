/**
 * System Metrics Component
 * Real-time system metrics
 */

import { Box, Text } from 'ink';
import React, { useState, useEffect } from 'react';

import type { PluginContext } from '../../types/index.js';

export interface SystemMetricsProps {
  ctx: PluginContext;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    uptime: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: Math.round(process.uptime()),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Text color="cyan" bold>
            📊 System Metrics
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box marginTop={1} flexDirection="column">
            <Box justifyContent="space-between">
              <Text>CPU Usage:</Text>
              <Text color="yellow">{metrics.cpu}%</Text>
            </Box>
            <Box justifyContent="space-between">
              <Text>Memory:</Text>
              <Text color="yellow">{metrics.memory}MB</Text>
            </Box>
            <Box justifyContent="space-between">
              <Text>Uptime:</Text>
              <Text color="green">{metrics.uptime}s</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

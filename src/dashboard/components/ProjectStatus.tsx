/**
 * Project Status Component
 * Shows real-time project health and status
 */

import { Box, Text } from 'ink';
import React from 'react';

import type { PluginContext } from '../../types/index.js';

interface ProjectData {
  name: string;
  version: string;
  status: string;
  dependencies: number;
  devDependencies: number;
  lastBuild: string;
}

export interface ProjectStatusProps {
  ctx: PluginContext;
  data: ProjectData | null;
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ ctx: _ctx, data }) => {
  if (!data) {
    return (
      <Box borderStyle="round" borderColor="gray" padding={1}>
        <Text dimColor>No project data available</Text>
      </Box>
    );
  }

  const statusColor = data.status === 'healthy' ? 'green' : 'yellow';
  const statusIcon = data.status === 'healthy' ? '✓' : '⚠';

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Text color="cyan" bold>
            📦 Project Status
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box marginTop={1} flexDirection="column">
            <Box justifyContent="space-between">
              <Box>
                <Text bold>{data.name}</Text>
                <Text dimColor> v{data.version}</Text>
              </Box>
              <Box>
                <Text color={statusColor}>{statusIcon}</Text>
                <Text color={statusColor}> {data.status}</Text>
              </Box>
            </Box>

            <Box marginTop={1} gap={4}>
              <Box flexDirection="column">
                <Text dimColor>Dependencies</Text>
                <Text color="yellow" bold>
                  {data.dependencies}
                </Text>
              </Box>

              <Box flexDirection="column">
                <Text dimColor>Dev Dependencies</Text>
                <Text color="yellow" bold>
                  {data.devDependencies}
                </Text>
              </Box>

              <Box flexDirection="column">
                <Text dimColor>Last Build</Text>
                <Text color="green">{new Date(data.lastBuild).toLocaleTimeString()}</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Plugin Manager Component
 * Visual plugin management
 */

import { Box, Text } from 'ink';
import React from 'react';

import type { PluginContext } from '../../types/index.js';

export interface PluginManagerProps {
  ctx: PluginContext;
}

export const PluginManager: React.FC<PluginManagerProps> = () => {
  const plugins = [
    { name: '@kubit/plugin-react', status: 'active', version: '1.0.0' },
    { name: '@kubit/plugin-typescript', status: 'active', version: '2.1.0' },
    { name: '@kubit/plugin-eslint', status: 'inactive', version: '1.5.0' },
  ];

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Text color="cyan" bold>
            🔌 Plugin Manager
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box marginTop={1} flexDirection="column">
            {plugins.map((plugin, i) => (
              <Box key={i} marginY={0.5}>
                <Text color={plugin.status === 'active' ? 'green' : 'gray'}>
                  {plugin.status === 'active' ? '●' : '○'}
                </Text>
                <Text> {plugin.name}</Text>
                <Text dimColor> v{plugin.version}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

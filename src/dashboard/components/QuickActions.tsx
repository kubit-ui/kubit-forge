/**
 * Quick Actions Component
 * Quick access buttons
 */

import { Box, Text } from 'ink';
import React from 'react';

import type { PluginContext } from '../../types/index.js';

export interface QuickActionsProps {
  ctx: PluginContext;
}

export const QuickActions: React.FC<QuickActionsProps> = () => {
  const actions = [
    { icon: '🏗️', key: 'b', label: 'Build' },
    { icon: '🧪', key: 't', label: 'Test' },
    { icon: '🔍', key: 'l', label: 'Lint' },
    { icon: '🏥', key: 'd', label: 'Doctor' },
    { icon: '📦', key: '6', label: 'Templates' },
  ];

  return (
    <Box borderStyle="round" borderColor="gray" paddingX={2} paddingY={1}>
      <Box flexDirection="column" width="100%">
        <Text color="cyan" bold>
          ⚡ Quick Actions
        </Text>
        <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        <Box marginTop={1} gap={2}>
          {actions.map((action, i) => (
            <Box key={i}>
              <Text color="cyan">[{action.key}]</Text>
              <Text>
                {' '}
                {action.icon} {action.label}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

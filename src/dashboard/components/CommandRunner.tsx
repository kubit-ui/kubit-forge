/**
 * Command Runner Component
 * Execute commands from the UI
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import React, { useState } from 'react';

import type { PluginContext } from '../../types/index.js';

export interface CommandRunnerProps {
  ctx: PluginContext;
}

interface CommandItem {
  label: string;
  value: string;
}

export const CommandRunner: React.FC<CommandRunnerProps> = ({ ctx: _ctx }) => {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  const commands: CommandItem[] = [
    { label: '🏗️  Build', value: 'build' },
    { label: '🧪 Test', value: 'test' },
    { label: '🔍 Lint', value: 'lint' },
    { label: '📝 Format', value: 'format' },
    { label: '🏥 Doctor', value: 'doctor' },
    { label: '🔄 Install', value: 'install' },
  ];

  const handleSelect = (item: CommandItem) => {
    setSelectedCommand(item.value);
    setIsRunning(true);
    setOutput([`Running ${item.label}...`]);

    // Simulate command execution
    setTimeout(() => {
      setOutput((prev) => [...prev, `✓ ${item.label} completed successfully`]);
      setIsRunning(false);
    }, 2000);
  };

  useInput((input) => {
    if (input === 'c' && !isRunning) {
      setSelectedCommand(null);
      setOutput([]);
    }
  });

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Text color="cyan" bold>
            ⚡ Command Runner
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          {!selectedCommand && !isRunning && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>Select a command to run:</Text>
              <Box marginTop={1}>
                <SelectInput items={commands} onSelect={handleSelect} />
              </Box>
            </Box>
          )}

          {isRunning && (
            <Box marginTop={1} flexDirection="column">
              <Box>
                <Text color="cyan">
                  <Spinner type="dots" />
                </Text>
                <Text> Executing command...</Text>
              </Box>
            </Box>
          )}

          {output.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text color="yellow" bold>
                Output:
              </Text>
              {output.map((line, i) => (
                <Text key={i}>{line}</Text>
              ))}
              {!isRunning && (
                <Box marginTop={1}>
                  <Text dimColor>Press </Text>
                  <Text color="cyan">c</Text>
                  <Text dimColor> to clear and run another command</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

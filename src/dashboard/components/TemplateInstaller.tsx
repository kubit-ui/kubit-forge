/**
 * Template Installer Component
 * Interactive template installation from dashboard
 */

import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import React, { useState, useEffect } from 'react';

import type { PluginContext } from '../../types/index.js';

import { TemplateRegistry, type TemplateInfo } from '../../core/template-registry.js';

export interface TemplateInstallerProps {
  ctx: PluginContext;
  onBack?: () => void;
}

export const TemplateInstaller: React.FC<TemplateInstallerProps> = ({ ctx, onBack }) => {
  const { exit } = useApp();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const registry = new TemplateRegistry(ctx.logger);
        const featured = await registry.getFeatured();
        setTemplates(featured);
      } catch (error) {
        ctx.logger.error('Failed to load templates', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const mapTemplateToValue = (template: TemplateInfo): string => {
    // Map registry template names to create command template values
    const nameMap: Record<string, string> = {
      'kubit/react-kubit-ui': 'react-kubit-ui',
      'kubit/react-lib-bernova': 'react-lib-bernova',
      'kubit/react-minimal': 'react-bernova',
      'kubit/react-recommended': 'react-ts-vite-bernova',
      'kubit/vanilla-js': 'vanilla-js',
      'kubit/vanilla-ts': 'vanilla-ts',
    };

    return nameMap[template.name] || 'react-ts-vite-bernova';
  };

  const installTemplate = async (template: TemplateInfo) => {
    const templateValue = mapTemplateToValue(template);

    // Store the template selection in a global variable that the dashboard can read
    (global as any).__selectedTemplate = templateValue;

    // Show message
    ctx.logger.info(`\n✨ Template seleccionado: ${template.name}`);
    ctx.logger.info('🚀 Cerrando dashboard e iniciando wizard de creación...\n');

    // Exit the dashboard - the parent command will show instructions
    exit();
  };

  // Keyboard navigation
  useInput(async (input, key) => {
    if (key.escape || input === 'b') {
      onBack?.();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(templates.length - 1, prev + 1));
    }

    if (input === 'i' || key.return) {
      setShowDetails(!showDetails);
    }

    if (input === 'c' && !showDetails) {
      // Create project with selected template
      await installTemplate(templates[selectedIndex]);
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text> Loading templates...</Text>
        </Box>
      </Box>
    );
  }

  const selectedTemplate = templates[selectedIndex];

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Text color="cyan" bold>
            📦 Template Installer
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
          <Box marginTop={1}>
            <Text dimColor>
              Use <Text color="cyan">↑/↓</Text> to navigate, <Text color="cyan">i/Enter</Text> for
              details, <Text color="cyan">c</Text> to create, <Text color="red">b/ESC</Text> to go
              back
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Template List */}
      <Box flexDirection="row" gap={2}>
        {/* Left: Template List */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          paddingX={2}
          paddingY={1}
          width={50}
        >
          <Text color="cyan" bold>
            Available Templates
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box flexDirection="column" marginTop={1}>
            {templates.map((template, index) => (
              <Box key={template.name} marginBottom={1}>
                <Text
                  color={index === selectedIndex ? 'cyan' : 'white'}
                  bold={index === selectedIndex}
                >
                  {index === selectedIndex ? '▶ ' : '  '}
                  {template.official ? '⭐ ' : ''}
                  {template.name}
                </Text>
              </Box>
            ))}
          </Box>

          {templates.length === 0 && (
            <Box marginTop={1}>
              <Text dimColor>No templates available</Text>
            </Box>
          )}
        </Box>

        {/* Right: Template Details */}
        {selectedTemplate && (
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={showDetails ? 'cyan' : 'gray'}
            paddingX={2}
            paddingY={1}
            flexGrow={1}
          >
            <Text color="cyan" bold>
              {selectedTemplate.name}
            </Text>
            <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

            <Box flexDirection="column" marginTop={1}>
              <Text>
                <Text dimColor>Version: </Text>
                <Text color="green">{selectedTemplate.version}</Text>
              </Text>
              <Text>
                <Text dimColor>Stack: </Text>
                <Text color="yellow">{selectedTemplate.stack}</Text>
              </Text>
              <Text>
                <Text dimColor>Author: </Text>
                <Text>{selectedTemplate.author}</Text>
              </Text>
              {selectedTemplate.official && (
                <Text>
                  <Text color="cyan">⭐ Official Template</Text>
                </Text>
              )}
            </Box>

            <Box marginTop={1}>
              <Text dimColor>{selectedTemplate.description}</Text>
            </Box>

            {showDetails && (
              <>
                <Box marginTop={1}>
                  <Text color="cyan" bold>
                    Features:
                  </Text>
                </Box>
                <Box flexDirection="column" marginTop={1}>
                  {selectedTemplate.features.map((feature, idx) => (
                    <Text key={idx}>
                      <Text color="green">✓</Text> {feature}
                    </Text>
                  ))}
                </Box>

                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <>
                    <Box marginTop={1}>
                      <Text color="cyan" bold>
                        Tags:
                      </Text>
                    </Box>
                    <Box marginTop={1}>
                      <Text dimColor>{selectedTemplate.tags.join(', ')}</Text>
                    </Box>
                  </>
                )}
              </>
            )}

            <Box marginTop={2} borderStyle="single" borderColor="cyan" paddingX={1}>
              <Text>
                <Text color="cyan" bold>
                  [c]
                </Text>{' '}
                Create new project with this template
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

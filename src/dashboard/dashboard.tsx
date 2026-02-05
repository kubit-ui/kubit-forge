/**
 * Interactive Dashboard - Main Component
 *
 * Professional TUI Dashboard using Ink + React
 */

import { Box, Text, useInput, useApp } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import Spinner from 'ink-spinner';
import React, { useState, useEffect } from 'react';

import type { PluginContext } from '../types/index.js';

import { CommandRunner } from './components/CommandRunner.js';
import { LiveLogs } from './components/LiveLogs.js';
import { PluginManager } from './components/PluginManager.js';
import { ProjectStatus } from './components/ProjectStatus.js';
import { QuickActions } from './components/QuickActions.js';
import { SystemMetrics } from './components/SystemMetrics.js';
import { TemplateInstaller } from './components/TemplateInstaller.js';

export interface DashboardProps {
  ctx: PluginContext;
}

type View = 'home' | 'commands' | 'logs' | 'plugins' | 'metrics' | 'templates';

interface ProjectData {
  name: string;
  version: string;
  status: string;
  lastBuild: string;
  dependencies: number;
  devDependencies: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ ctx }) => {
  const { exit } = useApp();
  const [currentView, setCurrentView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Load project data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load project information
        const data: ProjectData = {
          dependencies: 42,
          devDependencies: 18,
          lastBuild: new Date().toISOString(),
          name: 'My Project',
          status: 'healthy',
          version: '1.0.0',
        };
        setProjectData(data);
      } catch (error) {
        ctx.logger.error('Failed to load project data', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Keyboard shortcuts
  useInput(async (input, key) => {
    if (key.escape || input === 'q') {
      exit();
    }

    if (input === 'h') {
      setShowHelp(!showHelp);
    }

    if (input === '1') {
      setCurrentView('home');
    }
    if (input === '2') {
      setCurrentView('commands');
    }
    if (input === '3') {
      setCurrentView('logs');
    }
    if (input === '4') {
      setCurrentView('plugins');
    }
    if (input === '5') {
      setCurrentView('metrics');
    }
    if (input === '6') {
      setCurrentView('templates');
    }

    // Quick Actions
    if (input === 'b') {
      // Build
      try {
        const { buildCommand } = await import('../commands/build.js');
        ctx.logger.step('Starting build...');
        await buildCommand({}, ctx);
      } catch (error) {
        ctx.logger.error('Build failed', error as Error);
      }
    }

    if (input === 't') {
      // Test
      try {
        const { testCommand } = await import('../commands/test.js');
        ctx.logger.step('Running tests...');
        await testCommand({}, ctx);
      } catch (error) {
        ctx.logger.error('Tests failed', error as Error);
      }
    }

    if (input === 'l') {
      // Lint
      try {
        const { lintCommand } = await import('../commands/lint.js');
        ctx.logger.step('Running lint...');
        await lintCommand({}, ctx);
      } catch (error) {
        ctx.logger.error('Lint failed', error as Error);
      }
    }

    if (input === 'd') {
      // Doctor
      try {
        const { doctorCommand } = await import('../commands/doctor.js');
        ctx.logger.step('Running diagnostics...');
        await doctorCommand(ctx, {});
      } catch (error) {
        ctx.logger.error('Doctor failed', error as Error);
      }
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={2}>
        <Box marginBottom={1}>
          <Gradient name="rainbow">
            <BigText text="KUBIT" font="block" />
          </Gradient>
        </Box>
        <Box>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text> Loading dashboard...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Box justifyContent="space-between">
            <Box>
              <Gradient name="rainbow">
                <Text bold>⚡ KUBIT CLI DASHBOARD</Text>
              </Gradient>
            </Box>
            <Box>
              <Text dimColor>Press </Text>
              <Text color="yellow" bold>
                h
              </Text>
              <Text dimColor> for help | </Text>
              <Text color="red" bold>
                q
              </Text>
              <Text dimColor> to quit</Text>
            </Box>
          </Box>

          {/* Navigation */}
          <Box marginTop={1} gap={2}>
            <Text color={currentView === 'home' ? 'cyan' : 'gray'} bold={currentView === 'home'}>
              [1] Home
            </Text>
            <Text
              color={currentView === 'commands' ? 'cyan' : 'gray'}
              bold={currentView === 'commands'}
            >
              [2] Commands
            </Text>
            <Text color={currentView === 'logs' ? 'cyan' : 'gray'} bold={currentView === 'logs'}>
              [3] Logs
            </Text>
            <Text
              color={currentView === 'plugins' ? 'cyan' : 'gray'}
              bold={currentView === 'plugins'}
            >
              [4] Plugins
            </Text>
            <Text
              color={currentView === 'metrics' ? 'cyan' : 'gray'}
              bold={currentView === 'metrics'}
            >
              [5] Metrics
            </Text>
            <Text
              color={currentView === 'templates' ? 'cyan' : 'gray'}
              bold={currentView === 'templates'}
            >
              [6] Templates
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Help Panel */}
      {showHelp && (
        <Box borderStyle="round" borderColor="yellow" paddingX={2} paddingY={1} marginBottom={1}>
          <Box flexDirection="column">
            <Text color="yellow" bold>
              📖 Keyboard Shortcuts
            </Text>
            <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
            <Text>
              <Text color="cyan">1-6</Text> - Switch views
            </Text>
            <Text>
              <Text color="cyan">h</Text> - Toggle help
            </Text>
            <Text>
              <Text color="cyan">q/ESC</Text> - Quit dashboard
            </Text>
            <Text>
              <Text color="cyan">↑/↓</Text> - Navigate lists
            </Text>
            <Text>
              <Text color="cyan">Enter</Text> - Select/Execute
            </Text>
            <Text>
              <Text color="cyan">Tab</Text> - Next section
            </Text>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box flexDirection="row" flexGrow={1}>
        {/* Left Panel - Main View */}
        <Box flexDirection="column" flexGrow={1} marginRight={1}>
          {currentView === 'home' && (
            <Box flexDirection="column">
              <ProjectStatus ctx={ctx} data={projectData} />
              <Box marginTop={1}>
                <QuickActions ctx={ctx} />
              </Box>
            </Box>
          )}

          {currentView === 'commands' && <CommandRunner ctx={ctx} />}

          {currentView === 'logs' && <LiveLogs ctx={ctx} />}

          {currentView === 'plugins' && <PluginManager ctx={ctx} />}

          {currentView === 'metrics' && <SystemMetrics ctx={ctx} />}

          {currentView === 'templates' && (
            <TemplateInstaller ctx={ctx} onBack={() => setCurrentView('home')} />
          )}
        </Box>

        {/* Right Panel - System Info */}
        <Box flexDirection="column" width={40} borderStyle="round" borderColor="gray" paddingX={1}>
          <Text color="cyan" bold>
            📊 System Info
          </Text>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box flexDirection="column" marginTop={1}>
            <Text>
              <Text dimColor>Node: </Text>
              <Text color="green">{process.version}</Text>
            </Text>
            <Text>
              <Text dimColor>Platform: </Text>
              <Text color="green">{process.platform}</Text>
            </Text>
            <Text>
              <Text dimColor>Arch: </Text>
              <Text color="green">{process.arch}</Text>
            </Text>
            <Text>
              <Text dimColor>Memory: </Text>
              <Text color="green">
                {Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
              </Text>
            </Text>
            <Text>
              <Text dimColor>Uptime: </Text>
              <Text color="green">{Math.round(process.uptime())}s</Text>
            </Text>
          </Box>

          <Box marginTop={2}>
            <Text color="cyan" bold>
              🎯 Quick Stats
            </Text>
          </Box>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          {projectData && (
            <Box flexDirection="column" marginTop={1}>
              <Text>
                <Text dimColor>Dependencies: </Text>
                <Text color="yellow">{projectData.dependencies}</Text>
              </Text>
              <Text>
                <Text dimColor>Dev Deps: </Text>
                <Text color="yellow">{projectData.devDependencies}</Text>
              </Text>
              <Text>
                <Text dimColor>Status: </Text>
                <Text color="green">●</Text>
                <Text color="green"> {projectData.status}</Text>
              </Text>
            </Box>
          )}

          <Box marginTop={2}>
            <Text color="cyan" bold>
              ⚡ Recent Activity
            </Text>
          </Box>
          <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

          <Box flexDirection="column" marginTop={1}>
            <Text dimColor>• Dashboard started</Text>
            <Text dimColor>• Project loaded</Text>
            <Text dimColor>• Ready for commands</Text>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box borderStyle="round" borderColor="gray" paddingX={2} marginTop={1}>
        <Box justifyContent="space-between" width="100%">
          <Text dimColor>Kubit CLI v1.0.0 | CWD: {ctx.cwd}</Text>
          <Text dimColor>{new Date().toLocaleTimeString()}</Text>
        </Box>
      </Box>
    </Box>
  );
};

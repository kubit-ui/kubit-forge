/**
 * Demo script to showcase the UI system
 * Run with: node dist/utils/demo-ui.js
 */

import { createBanner, colors, symbols, createHeader, createBox, createDivider } from './theme.js';
import {
  displayWelcome,
  displaySuccess,
  displayError,
  displayNextSteps,
  displayCommands,
  displayProjectInfo,
  displayTaskList,
  displayWarning,
  displayInfo,
} from './ui-helpers.js';

export function runUIDemo(): void {
  console.clear();

  // 1. Banner
  console.log(createBanner('4.0.0'));
  console.log('');

  // 2. Welcome
  displayWelcome('Demo Mode', 'Showcasing the Kubit CLI UI system');

  // 3. Project Info
  displayProjectInfo({
    Language: 'TypeScript',
    Name: 'my-awesome-app',
    'Node Version': '20.x',
    'Package Manager': 'pnpm',
    Stack: 'React',
  });

  // 4. Task List
  console.log(createHeader('Installation Progress'));
  console.log('');
  displayTaskList([
    { name: 'Validate environment', status: 'done' },
    { name: 'Create directory structure', status: 'done' },
    { name: 'Copy template files', status: 'done' },
    { name: 'Install dependencies', status: 'running' },
    { name: 'Run initial build', status: 'pending' },
    { name: 'Setup git repository', status: 'pending' },
  ]);

  // 5. Logger Examples
  console.log(createHeader('Logger Output'));
  console.log('');
  console.log(colors.info(symbols.info), 'This is an info message');
  console.log(colors.success(symbols.success), 'This is a success message');
  console.log(colors.warning(symbols.warning), 'This is a warning message');
  console.log(colors.error(symbols.error), 'This is an error message');
  console.log(colors.primary(symbols.step), 'This is a step indicator');
  console.log(colors.muted(symbols.pointer), 'This is a debug message');
  console.log('');

  // 6. Warning Box
  displayWarning('This action will overwrite existing files. Make sure you have a backup.');

  // 7. Info Box
  displayInfo('Using default configuration from kubit.config.toml');

  // 8. Success Summary
  displaySuccess('Project Created Successfully', [
    'All files generated',
    'Configuration validated',
    'Dependencies installed',
    'Git repository initialized',
  ]);

  // 9. Next Steps
  displayNextSteps([
    'cd my-awesome-app',
    'pnpm install',
    'pnpm run dev',
    'Open http://localhost:5173',
  ]);

  // 10. Available Commands
  displayCommands('Available Commands', [
    { command: 'pnpm run dev', description: 'Start development server with hot reload' },
    { command: 'pnpm run build', description: 'Build optimized production bundle' },
    { command: 'pnpm run test', description: 'Run unit tests with Vitest' },
    { command: 'pnpm run lint', description: 'Lint code with ESLint' },
    { command: 'pnpm run format', description: 'Format code with Prettier' },
  ]);

  // 11. Error Example
  displayError('Build Failed', 'TypeScript compilation errors detected in 3 files', [
    'Run "pnpm run typecheck" to see detailed errors',
    'Check tsconfig.json for configuration issues',
    'Ensure all dependencies are installed',
  ]);

  // 12. Divider
  console.log(createDivider(60));
  console.log('');

  // 13. Custom Box
  console.log(
    createBox(
      'Kubit CLI v4.0.0\n\nModern Web Development Made Simple\n\nVisit https://kubit-forge.org for documentation',
      { color: 'primary', padding: 2, title: 'About' }
    )
  );
  console.log('');

  // 14. Footer
  console.log(colors.muted('  Learn more: ') + colors.link('https://kubit-forge.org'));
  console.log(
    colors.muted('  Report issues: ') + colors.link('https://github.com/kubit-ui/kubit-forge/issues')
  );
  console.log('');
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUIDemo();
}

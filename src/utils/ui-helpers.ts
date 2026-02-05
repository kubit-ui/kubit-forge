/**
 * UI Helper utilities for consistent CLI output
 */

import {
  colors,
  symbols,
  createBox,
  createHeader,
  createListItem,
  createProgress,
  createKeyValue,
  createCommand,
  createPath,
  createDivider,
} from './theme.js';

/**
 * Display a welcome message for a command
 */
export function displayWelcome(commandName: string, description: string): void {
  console.log('');
  console.log(colors.primary.bold(`${symbols.step} ${commandName.toUpperCase()}`));
  console.log(colors.muted(description));
  console.log(createDivider());
  console.log('');
}

/**
 * Display a success summary
 */
export function displaySuccess(title: string, items: string[]): void {
  console.log('');
  console.log(colors.success.bold(`${symbols.success} ${title}`));
  for (const item of items) {
    console.log(createListItem(item, true));
  }
  console.log('');
}

/**
 * Display an error summary
 */
export function displayError(title: string, message: string, suggestions?: string[]): void {
  console.log('');
  console.log(colors.error.bold(`${symbols.error} ${title}`));
  console.log(colors.error(message));

  if (suggestions && suggestions.length > 0) {
    console.log('');
    console.log(colors.muted('Suggestions:'));
    for (const suggestion of suggestions) {
      console.log(createListItem(suggestion));
    }
  }
  console.log('');
}

/**
 * Display project information
 */
export function displayProjectInfo(info: Record<string, string>): void {
  console.log(createHeader('Project Information'));
  console.log('');
  for (const [key, value] of Object.entries(info)) {
    console.log('  ' + createKeyValue(key, value));
  }
  console.log('');
}

/**
 * Display next steps
 */
export function displayNextSteps(steps: string[]): void {
  console.log(createHeader('Next Steps'));
  console.log('');
  for (let i = 0; i < steps.length; i++) {
    console.log(`  ${colors.primary((i + 1).toString() + '.')} ${steps[i]}`);
  }
  console.log('');
}

/**
 * Display command examples
 */
export function displayCommands(
  title: string,
  commands: Array<{ command: string; description: string }>
): void {
  console.log(createHeader(title));
  console.log('');
  for (const { command, description } of commands) {
    console.log('  ' + createCommand(command));
    console.log('  ' + colors.muted(description));
    console.log('');
  }
}

/**
 * Display a file tree structure
 */
export function displayFileTree(files: Array<{ path: string; isNew?: boolean }>): void {
  console.log(createHeader('Files'));
  console.log('');
  for (const { isNew, path } of files) {
    const prefix = isNew ? colors.success('+ ') : '  ';
    console.log(prefix + createPath(path));
  }
  console.log('');
}

/**
 * Display installation progress
 */
export function displayInstallProgress(current: number, total: number, packageName: string): void {
  const progress = createProgress(current, total, packageName);
  process.stdout.write('\r' + progress);
  if (current === total) {
    process.stdout.write('\n');
  }
}

/**
 * Display a warning box
 */
export function displayWarning(message: string): void {
  console.log('');
  console.log(createBox(message, { color: 'warning', title: 'WARNING' }));
  console.log('');
}

/**
 * Display an info box
 */
export function displayInfo(message: string): void {
  console.log('');
  console.log(createBox(message, { color: 'info', title: 'INFO' }));
  console.log('');
}

/**
 * Display a comparison table
 */
export function displayComparison(
  title: string,
  items: Array<{ label: string; before: string; after: string }>
): void {
  console.log(createHeader(title));
  console.log('');

  const maxLabelLength = Math.max(...items.map((i) => i.label.length));

  for (const { after, before, label } of items) {
    const paddedLabel = label.padEnd(maxLabelLength);
    console.log(
      `  ${colors.muted(paddedLabel)}  ${colors.error(before)} ${symbols.step} ${colors.success(after)}`
    );
  }
  console.log('');
}

/**
 * Display a task list with status
 */
export function displayTaskList(
  tasks: Array<{ name: string; status: 'pending' | 'running' | 'done' | 'error' }>
): void {
  console.log('');
  for (const task of tasks) {
    let statusIcon = '';
    let statusColor = colors.muted;

    switch (task.status) {
      case 'pending':
        statusIcon = symbols.bullet;
        statusColor = colors.muted;
        break;
      case 'running':
        statusIcon = symbols.step;
        statusColor = colors.primary;
        break;
      case 'done':
        statusIcon = symbols.success;
        statusColor = colors.success;
        break;
      case 'error':
        statusIcon = symbols.error;
        statusColor = colors.error;
        break;
    }

    console.log(`  ${statusColor(statusIcon)} ${task.name}`);
  }
  console.log('');
}

import chalk from 'chalk';

/**
 * Brand colors for Kubit CLI
 * Consistent color palette across all CLI output
 */
export const colors = {
  bold: chalk.bold,
  boolean: chalk.hex('#06b6d4'), // Cyan

  code: chalk.hex('#e879f9'),
  dim: chalk.dim,
  error: chalk.hex('#ef4444'), // Red
  info: chalk.hex('#3b82f6'), // Blue

  keyword: chalk.hex('#a855f7'), // Purple
  // Special
  link: chalk.hex('#3b82f6').underline,
  // UI colors
  muted: chalk.hex('#6b7280'), // Gray

  number: chalk.hex('#f97316'), // Orange
  // Primary brand colors
  primary: chalk.hex('#6366f1'), // Indigo - main brand color
  secondary: chalk.hex('#8b5cf6'), // Purple - accent color
  // Syntax highlighting
  string: chalk.hex('#22c55e'), // Green

  // Semantic colors
  success: chalk.hex('#10b981'), // Green
  warning: chalk.hex('#f59e0b'), // Amber
} as const;

/**
 * Box drawing characters for frames and borders
 */
export const box = {
  bottomLeft: '└',
  bottomRight: '┘',
  cross: '┼',
  horizontal: '─',
  horizontalDown: '┬',
  horizontalUp: '┴',
  topLeft: '┌',
  topRight: '┐',
  vertical: '│',
  verticalLeft: '┤',
  verticalRight: '├',
} as const;

/**
 * Symbols for different message types
 */
export const symbols = {
  bullet: '•',
  ellipsis: '...',
  error: '✗',
  info: 'i',
  line: '─',
  pointer: '›',
  step: '→',
  success: '✓',
  warning: '!',
} as const;

/**
 * Create a styled box with content
 */
export function createBox(
  content: string,
  options: {
    title?: string;
    padding?: number;
    color?: keyof typeof colors;
  } = {}
): string {
  const { color = 'primary', padding = 1, title } = options;
  const lines = content.split('\n');
  const maxLength = Math.max(...lines.map((l) => l.length));
  const width = maxLength + padding * 2;

  const colorFn = colors[color];
  const pad = ' '.repeat(padding);

  let result = '';

  // Top border
  if (title) {
    const titleText = ` ${title} `;
    const leftPad = Math.floor((width - titleText.length) / 2);
    const rightPad = width - titleText.length - leftPad;
    result +=
      colorFn(
        box.topLeft +
          box.horizontal.repeat(leftPad) +
          titleText +
          box.horizontal.repeat(rightPad) +
          box.topRight
      ) + '\n';
  } else {
    result += colorFn(box.topLeft + box.horizontal.repeat(width) + box.topRight) + '\n';
  }

  // Content
  for (const line of lines) {
    const paddedLine = line + ' '.repeat(maxLength - line.length);
    result += colorFn(box.vertical) + pad + paddedLine + pad + colorFn(box.vertical) + '\n';
  }

  // Bottom border
  result += colorFn(box.bottomLeft + box.horizontal.repeat(width) + box.bottomRight);

  return result;
}

/**
 * Create a banner with brand styling
 */
export function createBanner(version: string): string {
  const lines = [
    '',
    '  KUBIT CLI',
    `  v${version}`,
    '',
    '  Modern Web Development Made Simple',
    '',
  ];

  return createBox(lines.join('\n'), {
    color: 'primary',
    padding: 2,
  });
}

/**
 * Create a section header
 */
export function createHeader(text: string): string {
  return '\n' + colors.primary.bold(text) + '\n' + colors.muted(box.horizontal.repeat(text.length));
}

/**
 * Create a list item
 */
export function createListItem(text: string, checked = false): string {
  const symbol = checked ? colors.success(symbols.success) : colors.muted(symbols.bullet);
  return `${symbol} ${text}`;
}

/**
 * Create a progress indicator
 */
export function createProgress(current: number, total: number, label: string): string {
  const percentage = Math.round((current / total) * 100);
  const barLength = 20;
  const filled = Math.round((current / total) * barLength);
  const empty = barLength - filled;

  const bar = colors.primary('█'.repeat(filled)) + colors.muted('░'.repeat(empty));
  const counter = colors.muted(`[${current}/${total}]`);

  return `${bar} ${percentage}% ${counter} ${label}`;
}

/**
 * Create a key-value pair display
 */
export function createKeyValue(key: string, value: string): string {
  return `${colors.muted(key + ':')} ${colors.bold(value)}`;
}

/**
 * Create a command example
 */
export function createCommand(command: string): string {
  return colors.code(`$ ${command}`);
}

/**
 * Create a file path display
 */
export function createPath(path: string): string {
  return colors.info(path);
}

/**
 * Create a divider line
 */
export function createDivider(length = 50, char = box.horizontal): string {
  return colors.muted(char.repeat(length));
}

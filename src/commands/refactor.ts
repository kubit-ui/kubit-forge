import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface RefactorOptions {
  dryRun?: boolean;
}

export async function refactorRenameCommand(
  oldName: string,
  newName: string,
  options: RefactorOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  ctx.logger.step(`Refactoring: Rename ${oldName} → ${newName}`);

  const srcDir = join(ctx.cwd, 'src');
  const filesToUpdate: Array<{ file: string; changes: number }> = [];

  function scanDirectory(dir: string): void {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (entry.match(/\.(ts|tsx|js|jsx)$/)) {
        const content = readFileSync(fullPath, 'utf-8');
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        const matches = content.match(regex);

        if (matches) {
          filesToUpdate.push({ changes: matches.length, file: fullPath });

          if (!options.dryRun) {
            const updated = content.replace(regex, newName);
            writeFileSync(fullPath, updated);
          }
        }
      }
    }
  }

  scanDirectory(srcDir);

  if (filesToUpdate.length === 0) {
    ctx.logger.warn(`No occurrences of '${oldName}' found`);
    return { message: 'Nothing to refactor', status: 'ok' };
  }

  ctx.logger.info(`\nFiles to update (${filesToUpdate.length}):`);
  for (const { changes, file } of filesToUpdate) {
    ctx.logger.info(`  ${file} (${changes} changes)`);
  }

  if (options.dryRun) {
    ctx.logger.info('\n[DRY RUN] No changes made');
  } else {
    ctx.logger.success(`\n✓ Renamed ${oldName} → ${newName} in ${filesToUpdate.length} files`);
  }

  return {
    data: { filesUpdated: filesToUpdate.length },
    message: 'Refactor completed',
    status: 'ok',
  };
}

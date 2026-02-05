import { defineConfig } from 'tsup';
import { cpSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  shims: true,
  // External dependencies - don't bundle React/Ink to avoid multiple instances
  external: [
    'react',
    'ink',
    'ink-spinner',
    'ink-select-input',
    'ink-text-input',
    'ink-gradient',
    'ink-big-text',
    'ink-table',
    'ink-link',
  ],
  // bundle: true by default - templates are loaded at import time
  banner: {
    js: '#!/usr/bin/env node',
  },
  onSuccess: async () => {
    // Copy src/templates directory to dist
    const srcTemplates = join(process.cwd(), 'src', 'templates');
    const distSrcTemplates = join(process.cwd(), 'dist', 'templates');
    cpSync(srcTemplates, distSrcTemplates, { recursive: true });
    console.log('✓ src/templates copied to dist');

    // Copy templates directory (physical templates) to dist
    const physicalTemplates = join(process.cwd(), 'templates');
    const distPhysicalTemplates = join(process.cwd(), 'dist', 'templates-physical');
    cpSync(physicalTemplates, distPhysicalTemplates, { recursive: true });
    console.log('✓ Physical templates copied to dist');
  },
});

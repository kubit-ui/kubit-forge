import { cpSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'tsup';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
  dts: true,
  entry: ['src/cli.ts', 'src/index.ts'],
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
  format: ['esm'],
  minify: !isDev, // Minify only in production
  // bundle: true by default - templates are loaded at import time
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
  shims: true,
  sourcemap: isDev, // Enable sourcemaps only in development (saves ~1MB in production)
  splitting: true, // Enable code splitting for better tree-shaking
  treeshake: true, // Remove unused code
});

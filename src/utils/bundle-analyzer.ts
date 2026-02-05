import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';

import type { Logger } from '../types/index.js';

export interface BundleAnalysis {
  totalSize: number;
  gzipSize: number;
  files: BundleFile[];
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  warnings: string[];
  recommendations: string[];
}

export interface BundleFile {
  name: string;
  size: number;
  gzipSize: number;
  type: 'js' | 'css' | 'html' | 'asset';
  path: string;
}

export interface ChunkInfo {
  name: string;
  size: number;
  modules: number;
  isEntry: boolean;
}

export interface AssetInfo {
  name: string;
  size: number;
  type: string;
  optimized: boolean;
}

export class BundleAnalyzer {
  constructor(
    private readonly cwd: string,
    private readonly logger: Logger
  ) {}

  async analyze(buildDir: string = 'dist'): Promise<BundleAnalysis> {
    const distPath = join(this.cwd, buildDir);

    if (!existsSync(distPath)) {
      throw new Error(`Build directory not found: ${buildDir}`);
    }

    this.logger.step('Analyzing bundle...');

    const files = this.scanDirectory(distPath);
    const analysis: BundleAnalysis = {
      assets: [],
      chunks: [],
      files: [],
      gzipSize: 0,
      recommendations: [],
      totalSize: 0,
      warnings: [],
    };

    // Analyze files
    for (const file of files) {
      const stats = statSync(file);
      const relativePath = file.replace(distPath + '/', '');
      const ext = extname(file).slice(1);
      const type = this.getFileType(ext);

      const bundleFile: BundleFile = {
        gzipSize: Math.floor(stats.size * 0.3), // Approximate gzip ratio
        name: relativePath,
        path: file,
        size: stats.size,
        type,
      };

      analysis.files.push(bundleFile);
      analysis.totalSize += stats.size;
      analysis.gzipSize += bundleFile.gzipSize;

      // Categorize as chunk or asset
      if (type === 'js') {
        analysis.chunks.push({
          isEntry: relativePath.includes('index') || relativePath.includes('main'),
          modules: this.estimateModuleCount(file),
          name: relativePath,
          size: stats.size,
        });
      } else if (type !== 'html') {
        analysis.assets.push({
          name: relativePath,
          optimized: this.isOptimized(file, ext),
          size: stats.size,
          type: ext,
        });
      }
    }

    // Generate warnings and recommendations
    this.generateInsights(analysis);

    return analysis;
  }

  private scanDirectory(dir: string, files: string[] = []): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private getFileType(ext: string): 'js' | 'css' | 'html' | 'asset' {
    if (ext === 'js' || ext === 'mjs' || ext === 'cjs') {
      return 'js';
    }
    if (ext === 'css') {
      return 'css';
    }
    if (ext === 'html') {
      return 'html';
    }
    return 'asset';
  }

  private estimateModuleCount(file: string): number {
    try {
      const content = readFileSync(file, 'utf-8');
      // Rough estimate based on import/require statements
      const imports = (content.match(/import\s+/g) || []).length;
      const requires = (content.match(/require\(/g) || []).length;
      return imports + requires || 1;
    } catch {
      return 1;
    }
  }

  private isOptimized(file: string, ext: string): boolean {
    try {
      const content = readFileSync(file, 'utf-8');

      // Check for minification indicators
      if (ext === 'js') {
        // Minified JS typically has very long lines
        const lines = content.split('\n');
        const avgLineLength = content.length / lines.length;
        return avgLineLength > 200;
      }

      if (ext === 'css') {
        // Minified CSS has no whitespace
        return !content.includes('\n  ');
      }

      return false;
    } catch {
      return false;
    }
  }

  private generateInsights(analysis: BundleAnalysis): void {
    // Check total bundle size
    const totalMB = analysis.totalSize / (1024 * 1024);
    if (totalMB > 5) {
      analysis.warnings.push(`Large bundle size: ${totalMB.toFixed(2)}MB`);
      analysis.recommendations.push('Consider code splitting and lazy loading');
    }

    // Check individual chunk sizes
    for (const chunk of analysis.chunks) {
      const chunkKB = chunk.size / 1024;
      if (chunkKB > 500) {
        analysis.warnings.push(`Large chunk: ${chunk.name} (${chunkKB.toFixed(2)}KB)`);
        analysis.recommendations.push(`Split ${chunk.name} into smaller chunks`);
      }
    }

    // Check for unoptimized assets
    const unoptimized = analysis.assets.filter((a) => !a.optimized);
    if (unoptimized.length > 0) {
      analysis.warnings.push(`${unoptimized.length} unoptimized asset(s) found`);
      analysis.recommendations.push('Enable asset optimization in build config');
    }

    // Check for duplicate dependencies
    const jsChunks = analysis.chunks.filter((c) => c.name.endsWith('.js'));
    if (jsChunks.length > 10) {
      analysis.recommendations.push('Consider using vendor chunk splitting');
    }

    // Check gzip ratio
    const gzipRatio = analysis.gzipSize / analysis.totalSize;
    if (gzipRatio > 0.5) {
      analysis.recommendations.push('Enable Brotli compression for better compression ratios');
    }
  }

  displayAnalysis(analysis: BundleAnalysis): void {
    this.logger.info('');
    this.logger.info('═'.repeat(60));
    this.logger.info('Bundle Analysis Report');
    this.logger.info('═'.repeat(60));
    this.logger.info('');

    // Summary
    this.logger.info('Summary:');
    this.logger.info(`  Total Size: ${this.formatSize(analysis.totalSize)}`);
    this.logger.info(`  Gzipped: ${this.formatSize(analysis.gzipSize)}`);
    this.logger.info(`  Files: ${analysis.files.length}`);
    this.logger.info(`  Chunks: ${analysis.chunks.length}`);
    this.logger.info(`  Assets: ${analysis.assets.length}`);
    this.logger.info('');

    // Largest chunks
    if (analysis.chunks.length > 0) {
      const sorted = [...analysis.chunks].sort((a, b) => b.size - a.size).slice(0, 5);
      this.logger.info('Largest Chunks:');
      for (const chunk of sorted) {
        const size = this.formatSize(chunk.size);
        const entry = chunk.isEntry ? '(entry)' : '';
        this.logger.info(`  ${chunk.name}: ${size} ${entry}`);
      }
      this.logger.info('');
    }

    // Asset breakdown
    if (analysis.assets.length > 0) {
      const assetsByType = this.groupAssetsByType(analysis.assets);
      this.logger.info('Assets by Type:');
      for (const [type, assets] of Object.entries(assetsByType)) {
        const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
        this.logger.info(`  ${type}: ${assets.length} files (${this.formatSize(totalSize)})`);
      }
      this.logger.info('');
    }

    // Warnings
    if (analysis.warnings.length > 0) {
      this.logger.warn('⚠️  Warnings:');
      for (const warning of analysis.warnings) {
        this.logger.warn(`  • ${warning}`);
      }
      this.logger.info('');
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      this.logger.info('💡 Recommendations:');
      for (const rec of analysis.recommendations) {
        this.logger.info(`  • ${rec}`);
      }
      this.logger.info('');
    }

    this.logger.info('═'.repeat(60));
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes}B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }

  private groupAssetsByType(assets: AssetInfo[]): Record<string, AssetInfo[]> {
    const grouped: Record<string, AssetInfo[]> = {};

    for (const asset of assets) {
      if (!grouped[asset.type]) {
        grouped[asset.type] = [];
      }
      grouped[asset.type].push(asset);
    }

    return grouped;
  }
}

import { createHash } from 'crypto';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
  readdirSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface CacheEntry {
  hash: string;
  timestamp: number;
  inputs: string[];
  outputs?: string[];
  success: boolean;
  duration: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hits: number;
  misses: number;
  location: string;
}

export class TaskCache {
  private cacheDir: string;
  private logger: Logger;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(cwd: string, logger: Logger) {
    this.cacheDir = join(cwd, 'node_modules', '.cache', 'kubit-forge');
    this.logger = logger;
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate hash for task inputs
   */
  private hashInputs(inputs: string[]): string {
    const hash = createHash('sha256');

    for (const input of inputs.sort()) {
      if (existsSync(input)) {
        const stat = statSync(input);
        if (stat.isFile()) {
          const content = readFileSync(input);
          hash.update(content);
        } else if (stat.isDirectory()) {
          // Hash directory structure and file mtimes
          hash.update(input);
          hash.update(stat.mtime.toISOString());
        }
      } else {
        // Input doesn't exist, include in hash
        hash.update(`missing:${input}`);
      }
    }

    return hash.digest('hex');
  }

  /**
   * Get cache entry for a task
   */
  get(taskName: string, inputs: string[]): CacheEntry | null {
    const cacheFile = join(this.cacheDir, `${taskName}.json`);

    if (!existsSync(cacheFile)) {
      this.stats.misses++;
      return null;
    }

    try {
      const entry: CacheEntry = JSON.parse(readFileSync(cacheFile, 'utf-8'));
      const currentHash = this.hashInputs(inputs);

      if (entry.hash === currentHash) {
        this.stats.hits++;
        this.logger.debug(`Cache HIT for ${taskName}`);
        return entry;
      }
      this.stats.misses++;
      this.logger.debug(`Cache MISS for ${taskName} (hash mismatch)`);
      return null;
    } catch (error) {
      this.logger.debug(`Cache error for ${taskName}: ${(error as Error).message}`);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set cache entry for a task
   */
  set(
    taskName: string,
    inputs: string[],
    success: boolean,
    duration: number,
    outputs?: string[]
  ): void {
    const entry: CacheEntry = {
      duration,
      hash: this.hashInputs(inputs),
      inputs,
      outputs,
      success,
      timestamp: Date.now(),
    };

    const cacheFile = join(this.cacheDir, `${taskName}.json`);

    try {
      writeFileSync(cacheFile, JSON.stringify(entry, null, 2));
      this.logger.debug(`Cached result for ${taskName}`);
    } catch (error) {
      this.logger.debug(`Failed to cache ${taskName}: ${(error as Error).message}`);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    if (existsSync(this.cacheDir)) {
      const files = readdirSync(this.cacheDir);
      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        try {
          if (statSync(filePath).isFile()) {
            // Use fs.unlinkSync instead of fs.rmSync for better compatibility
            unlinkSync(filePath);
          }
        } catch (error) {
          this.logger.debug(`Failed to delete ${file}: ${(error as Error).message}`);
        }
      }
      this.logger.success('Cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalEntries = 0;
    let totalSize = 0;

    if (existsSync(this.cacheDir)) {
      const files = readdirSync(this.cacheDir);
      totalEntries = files.length;

      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        try {
          const stat = statSync(filePath);
          if (stat.isFile()) {
            totalSize += stat.size;
          }
        } catch {
          // Ignore errors
        }
      }
    }

    return {
      hits: this.stats.hits,
      location: this.cacheDir,
      misses: this.stats.misses,
      totalEntries,
      totalSize,
    };
  }

  /**
   * Invalidate cache for specific task
   */
  invalidate(taskName: string): void {
    const cacheFile = join(this.cacheDir, `${taskName}.json`);
    if (existsSync(cacheFile)) {
      unlinkSync(cacheFile);
      this.logger.debug(`Invalidated cache for ${taskName}`);
    }
  }

  /**
   * Check if cache is valid for task
   */
  isValid(taskName: string, inputs: string[]): boolean {
    return this.get(taskName, inputs) !== null;
  }
}

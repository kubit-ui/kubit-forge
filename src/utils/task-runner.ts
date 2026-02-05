import { execa } from 'execa';

import type { TaskRunner, TaskResult, RunOptions, Logger } from '../types/index.js';

export class DefaultTaskRunner implements TaskRunner {
  private tasks: Map<string, () => Promise<TaskResult>> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  registerTask(name: string, task: () => Promise<TaskResult>): void {
    this.tasks.set(name, task);
  }

  async run(command: string, args: string[] = [], options: RunOptions = {}): Promise<TaskResult> {
    const startTime = Date.now();
    const cwd = options.cwd || process.cwd();

    try {
      if (!options.silent) {
        this.logger.debug(`Running: ${command} ${args.join(' ')}`);
      }

      const result = await execa(command, args, {
        all: true,
        cwd,
        env: { ...process.env, ...options.env },
        reject: false,
      });

      const duration = Date.now() - startTime;

      if (result.exitCode === 0) {
        return {
          duration,
          exitCode: result.exitCode,
          output: options.captureOutput ? result.all : undefined,
          status: 'ok',
        };
      }
      return {
        duration,
        exitCode: result.exitCode,
        message: `Command failed with exit code ${result.exitCode}`,
        output: result.all,
        status: 'error',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        duration,
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      };
    }
  }

  async runTask(taskName: string): Promise<TaskResult> {
    const task = this.tasks.get(taskName);
    if (!task) {
      return {
        message: `Task '${taskName}' not found`,
        status: 'error',
      };
    }

    return await task();
  }
}

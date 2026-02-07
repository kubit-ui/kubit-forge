import type { IncomingMessage, ServerResponse } from 'http';

import { execa } from 'execa';
import { readFileSync, readdirSync, statSync } from 'fs';
import { writeFileSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { stringify as tomlStringify } from 'smol-toml';

import type { KubitConfig, Logger } from '../types/index.js';

export interface GuiServerOptions {
  port?: number;
  host?: string;
  open?: boolean;
  config: KubitConfig;
  cwd: string;
  logger: Logger;
}

export class AdvancedGuiServer {
  private server: any;
  private port: number;
  private host: string;
  private config: KubitConfig;
  private cwd: string;
  private logger: Logger;
  private consoleLogs: Array<{ timestamp: string; type: string; message: string }> = [];

  constructor(options: GuiServerOptions) {
    this.port = options.port || 3030;
    this.host = options.host || 'localhost';
    this.config = options.config;
    this.cwd = options.cwd;
    this.logger = options.logger;
  }

  private addLog(type: string, message: string) {
    this.consoleLogs.push({
      message,
      timestamp: new Date().toISOString(),
      type,
    });
    // Keep only last 100 logs
    if (this.consoleLogs.length > 100) {
      this.consoleLogs.shift();
    }
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          this.port++;
          this.server.listen(this.port, this.host);
        } else {
          reject(err);
        }
      });

      this.server.listen(this.port, this.host, () => {
        const url = `http://${this.host}:${this.port}`;
        this.logger.success(`\n🎨 Kubit Forge Advanced GUI running at: ${url}\n`);

        // Add welcome logs
        this.addLog('success', '🎨 Kubit Forge GUI started successfully!');
        this.addLog('info', `🌐 Server running at: ${url}`);
        this.addLog('info', '📟 Console is ready - Execute commands to see output here');
        this.addLog('info', '💡 Tip: You can drag, resize, minimize, or maximize this console');

        resolve(url);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('GUI server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = req.url || '/';

    // API endpoints
    if (url.startsWith('/api/')) {
      this.handleApiRequest(url, req, res);
      return;
    }

    // Serve static files
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.getHtml());
    } else if (url === '/styles.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(this.getStyles());
    } else if (url === '/app.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(this.getApp());
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  private async handleApiRequest(
    url: string,
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      if (url === '/api/dashboard') {
        const stats = await this.getProjectStats();
        const gitStatus = await this.getGitStatus();
        res.writeHead(200);
        res.end(JSON.stringify({ gitStatus, stats }));
        return;
      }

      if (url === '/api/config' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ config: this.config, cwd: this.cwd }));
        return;
      }

      if (url === '/api/config' && req.method === 'POST') {
        const body = await this.readBody(req);
        const updatedConfig = JSON.parse(body);
        const configPath = join(this.cwd, 'kubit.config.toml');
        writeFileSync(configPath, tomlStringify(updatedConfig), 'utf-8');
        this.config = updatedConfig;
        res.writeHead(200);
        res.end(JSON.stringify({ config: updatedConfig, success: true }));
        return;
      }

      if (url === '/api/command/execute' && req.method === 'POST') {
        const body = await this.readBody(req);
        const { command } = JSON.parse(body);
        const pm = this.config.project.packageManager || 'npm';

        this.addLog('info', `🚀 Executing: ${pm} run ${command}`);
        this.addLog('info', `📂 Working directory: ${this.cwd}`);

        try {
          // Execute with streaming output
          const subprocess = execa(pm, ['run', command], {
            all: true,
            buffer: true,
            cwd: this.cwd,
            reject: false,
          });

          // Capture stdout in real-time
          if (subprocess.stdout) {
            subprocess.stdout.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stdout', output);
              }
            });
          }

          // Capture stderr in real-time
          if (subprocess.stderr) {
            subprocess.stderr.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stderr', output);
              }
            });
          }

          const result = await subprocess;

          // Add final output if not captured in real-time
          if (result.stdout && !subprocess.stdout) {
            const lines = result.stdout.split('\\n').filter((l) => l.trim());
            lines.forEach((line) => this.addLog('stdout', line));
          }
          if (result.stderr && !subprocess.stderr) {
            const lines = result.stderr.split('\\n').filter((l) => l.trim());
            lines.forEach((line) => this.addLog('stderr', line));
          }

          if (result.exitCode === 0) {
            this.addLog('success', `✅ Command "${command}" completed successfully`);
            res.writeHead(200);
            res.end(
              JSON.stringify({
                message: `${command} completed successfully`,
                output: result.stdout || result.all || '',
                success: true,
              })
            );
          } else {
            this.addLog(
              'error',
              `❌ Command "${command}" failed with exit code ${result.exitCode}`
            );
            res.writeHead(200);
            res.end(
              JSON.stringify({
                error: result.stderr || result.stdout || result.all || 'Command failed',
                exitCode: result.exitCode,
                message: `${command} failed`,
                success: false,
              })
            );
          }
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          this.addLog('error', `💥 Error executing "${command}": ${errorMsg}`);

          // Try to provide more helpful error messages
          if (errorMsg.includes('ENOENT')) {
            this.addLog('error', `Package manager "${pm}" not found. Please install it first.`);
          } else if (
            errorMsg.includes('command not found') ||
            errorMsg.includes('not recognized')
          ) {
            try {
              const pkg = JSON.parse(readFileSync(join(this.cwd, 'package.json'), 'utf-8'));
              const availableScripts = Object.keys(pkg.scripts || {}).join(', ') || 'none';
              this.addLog(
                'error',
                `Script "${command}" not found in package.json. Available scripts: ${availableScripts}`
              );
            } catch {
              this.addLog('error', `Script "${command}" not found in package.json`);
            }
          }

          res.writeHead(200);
          res.end(
            JSON.stringify({
              error: errorMsg,
              message: `Failed to execute ${command}`,
              success: false,
            })
          );
        }
        return;
      }

      if (url === '/api/console/logs') {
        res.writeHead(200);
        res.end(JSON.stringify({ logs: this.consoleLogs }));
        return;
      }

      if (url === '/api/console/clear' && req.method === 'POST') {
        this.consoleLogs = [];
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        return;
      }

      if (url === '/api/commands/available') {
        try {
          const pkg = JSON.parse(readFileSync(join(this.cwd, 'package.json'), 'utf-8'));
          const scripts = pkg.scripts || {};
          const commands = Object.keys(scripts).map((name) => ({
            description: scripts[name],
            name,
          }));
          res.writeHead(200);
          res.end(JSON.stringify({ commands }));
        } catch (error: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
        return;
      }

      if (url === '/api/dependencies') {
        const deps = this.getDependencies();
        res.writeHead(200);
        res.end(JSON.stringify(deps));
        return;
      }

      if (url === '/api/git/commits') {
        const commits = await this.getGitCommits();
        res.writeHead(200);
        res.end(JSON.stringify({ commits }));
        return;
      }

      if (url === '/api/templates') {
        res.writeHead(200);
        res.end(JSON.stringify({ templates: this.getTemplates() }));
        return;
      }

      if (url === '/api/template/create' && req.method === 'POST') {
        const body = await this.readBody(req);
        const { name, targetDir, template } = JSON.parse(body);

        const projectPath = targetDir ? join(targetDir, name) : join(this.cwd, '..', name);

        this.addLog('info', `🚀 Creating project "${name}" from template "${template}"`);
        this.addLog('info', `📂 Target directory: ${projectPath}`);

        try {
          // Execute kubit-forge init with streaming output
          const subprocess = execa('kubit-forge', ['init', template, name], {
            all: true,
            buffer: false,
            cwd: targetDir || join(this.cwd, '..'),
            reject: false,
          });

          // Capture stdout in real-time
          if (subprocess.stdout) {
            subprocess.stdout.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stdout', output);
              }
            });
          }

          // Capture stderr in real-time
          if (subprocess.stderr) {
            subprocess.stderr.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stderr', output);
              }
            });
          }

          const result = await subprocess;

          if (result.exitCode === 0) {
            this.addLog('success', `✅ Project "${name}" created successfully!`);
            this.addLog('info', `📍 Location: ${projectPath}`);
            this.addLog('info', `💡 Next steps: cd ${name} && npm install && npm run dev`);

            res.writeHead(200);
            res.end(
              JSON.stringify({
                message: `Project ${name} created successfully`,
                path: projectPath,
                success: true,
              })
            );
          } else {
            this.addLog('error', `❌ Failed to create project "${name}"`);
            res.writeHead(200);
            res.end(
              JSON.stringify({
                error: result.stderr || result.all || 'Template creation failed',
                exitCode: result.exitCode,
                message: `Failed to create ${name}`,
                success: false,
              })
            );
          }
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          this.addLog('error', `💥 Error creating project: ${errorMsg}`);

          res.writeHead(200);
          res.end(
            JSON.stringify({
              error: errorMsg,
              message: `Failed to create project ${name}`,
              success: false,
            })
          );
        }
        return;
      }

      if (url === '/api/features') {
        res.writeHead(200);
        res.end(JSON.stringify({ features: this.getFeatures() }));
        return;
      }

      if (url === '/api/feature/install' && req.method === 'POST') {
        const body = await this.readBody(req);
        const { feature } = JSON.parse(body);

        this.addLog('info', `🔧 Installing feature: ${feature}`);
        this.addLog('info', `📂 Project: ${this.cwd}`);

        try {
          const subprocess = execa('kubit-forge', ['add', feature], {
            all: true,
            buffer: false,
            cwd: this.cwd,
            reject: false,
          });

          // Capture stdout in real-time
          if (subprocess.stdout) {
            subprocess.stdout.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stdout', output);
              }
            });
          }

          // Capture stderr in real-time
          if (subprocess.stderr) {
            subprocess.stderr.on('data', (data) => {
              const output = data.toString().trim();
              if (output) {
                this.addLog('stderr', output);
              }
            });
          }

          const result = await subprocess;

          if (result.exitCode === 0) {
            this.addLog('success', `✅ Feature "${feature}" installed successfully`);
            res.writeHead(200);
            res.end(
              JSON.stringify({
                message: `Feature ${feature} installed`,
                success: true,
              })
            );
          } else {
            this.addLog('error', `❌ Failed to install feature "${feature}"`);
            res.writeHead(200);
            res.end(
              JSON.stringify({
                error: result.stderr || result.all || 'Installation failed',
                message: `Failed to install ${feature}`,
                success: false,
              })
            );
          }
        } catch (error: any) {
          this.addLog('error', `💥 Error installing feature: ${error.message}`);
          res.writeHead(200);
          res.end(
            JSON.stringify({
              error: error.message,
              message: `Failed to install ${feature}`,
              success: false,
            })
          );
        }
        return;
      }

      if (url === '/api/files') {
        const files = this.listFiles();
        res.writeHead(200);
        res.end(JSON.stringify({ files }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error: any) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  private async readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => resolve(body));
    });
  }

  private async getProjectStats() {
    try {
      const pkg = JSON.parse(readFileSync(join(this.cwd, 'package.json'), 'utf-8'));
      return {
        dependencies: Object.keys(pkg.dependencies || {}).length,
        devDependencies: Object.keys(pkg.devDependencies || {}).length,
        name: pkg.name,
        version: pkg.version,
      };
    } catch {
      return { dependencies: 0, devDependencies: 0, name: 'Unknown', version: '0.0.0' };
    }
  }

  private async getGitStatus() {
    try {
      const branch = await execa('git', ['branch', '--show-current'], { cwd: this.cwd });
      const status = await execa('git', ['status', '--porcelain'], { cwd: this.cwd });
      return {
        branch: branch.stdout.trim(),
        changes: status.stdout.split('\n').filter((l) => l).length,
        clean: !status.stdout.trim(),
      };
    } catch {
      return { branch: 'N/A', changes: 0, clean: true, error: 'Not a git repo' };
    }
  }

  private async getGitCommits() {
    try {
      const result = await execa('git', ['log', '--oneline', '-10'], { cwd: this.cwd });
      return result.stdout
        .split('\n')
        .filter((l) => l)
        .map((line) => {
          const [hash, ...msg] = line.split(' ');
          return { hash, message: msg.join(' ') };
        });
    } catch {
      return [];
    }
  }

  private getDependencies() {
    try {
      const pkg = JSON.parse(readFileSync(join(this.cwd, 'package.json'), 'utf-8'));
      return {
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
      };
    } catch {
      return { dependencies: [], devDependencies: [] };
    }
  }

  private getTemplates() {
    return [
      {
        description: 'React with TypeScript and Vite - Modern React setup with hot reload',
        id: 'react',
        name: '⚛️ React',
      },
      {
        description:
          'React + Bernova Design System - Pre-configured with Bernova components and theming',
        id: 'react-bernova',
        name: '🎨 React + Bernova',
      },
      {
        description: 'React + Kubit UI - Complete Kubit UI component library integration',
        id: 'react-kubit-ui',
        name: '🎯 React + Kubit UI',
      },
      {
        description: 'Full Kubit Stack - React + Kubit UI + Bernova + All features pre-configured',
        id: 'kubit-full',
        name: '🚀 Kubit Full Stack',
      },
      {
        description: 'Vanilla TypeScript - Lightweight setup with Vite and TypeScript',
        id: 'vanilla',
        name: '⚡ Vanilla TS',
      },
    ];
  }

  private getFeatures() {
    return [
      { description: 'ESLint code linting', id: 'eslint', name: 'ESLint' },
      { description: 'Prettier formatting', id: 'prettier', name: 'Prettier' },
      { description: 'Vitest unit testing', id: 'vitest', name: 'Vitest' },
      { description: 'Testing Library', id: 'testing-library', name: 'Testing Library' },
      { description: 'Playwright E2E', id: 'playwright', name: 'Playwright' },
      { description: 'Storybook', id: 'storybook', name: 'Storybook' },
      { description: 'Husky git hooks', id: 'husky', name: 'Husky' },
      { description: 'Styled Components', id: 'styled-components', name: 'Styled Components' },
      { description: 'React Router', id: 'react-router', name: 'React Router' },
    ];
  }

  private listFiles() {
    try {
      const files: any[] = [];
      const items = readdirSync(this.cwd);

      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
          continue;
        }

        const fullPath = join(this.cwd, item);
        const stat = statSync(fullPath);

        files.push({
          name: item,
          size: stat.isFile() ? stat.size : 0,
          type: stat.isDirectory() ? 'directory' : 'file',
        });
      }

      return files.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });
    } catch {
      return [];
    }
  }

  private getHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kubit Forge GUI</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;
  }

  private getStyles() {
    return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; min-height: 100vh; }
#root { max-width: 1400px; margin: 0 auto; padding: 2rem; }
.header { text-align: center; padding: 2rem 0; border-bottom: 2px solid #df2b52; margin-bottom: 2rem; }
.header h1 { font-size: 2.5rem; color: #fff; margin-bottom: 0.5rem; }
.header p { color: #999; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #333; flex-wrap: wrap; }
.tab { background: transparent; border: none; color: #999; padding: 1rem 1.5rem; cursor: pointer; font-size: 1rem; border-bottom: 2px solid transparent; }
.tab:hover { color: #fff; background: #111; }
.tab.active { color: #fff; border-bottom-color: #df2b52; background: #111; }
.content { background: #111; border-radius: 4px; padding: 2rem; border: 1px solid #333; }
.title { font-size: 1.5rem; margin-bottom: 1.5rem; color: #fff; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.card { background: #000; padding: 1.5rem; border-radius: 4px; border: 1px solid #333; }
.card:hover { border-color: #df2b52; }
.card.clickable { cursor: pointer; }
.card.clickable:hover { background: #1a1a1a; }
.card-title { font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
.card-desc { color: #999; font-size: 0.875rem; }
.stat-value { font-size: 2rem; font-weight: 700; color: #df2b52; text-align: center; }
.stat-label { font-size: 0.875rem; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }
.git-info { background: #000; padding: 1rem; border-radius: 4px; border-left: 3px solid #df2b52; margin-bottom: 1rem; }
.git-branch { font-weight: 600; color: #df2b52; }
.commit { padding: 0.75rem; background: #000; border: 1px solid #333; border-radius: 4px; margin-bottom: 0.5rem; }
.commit-hash { font-family: monospace; color: #df2b52; margin-right: 0.5rem; }
.deps { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
.dep { background: #000; padding: 0.5rem 1rem; border: 1px solid #333; border-radius: 4px; font-size: 0.875rem; }
.dep.prod { border-left: 3px solid #df2b52; }
.dep.dev { border-left: 3px solid #666; }
.form-group { margin-bottom: 1rem; }
.form-label { display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500; }
.form-input, .form-select { width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid #333; background: #000; color: #fff; font-size: 1rem; }
.form-input:focus, .form-select:focus { outline: none; border-color: #df2b52; }
.form-checkbox { accent-color: #df2b52; margin-right: 0.5rem; }
.checkbox-group { display: flex; align-items: center; margin-bottom: 0.5rem; }
.btn { background: #df2b52; color: #fff; border: none; padding: 1rem 2rem; border-radius: 4px; font-size: 1rem; font-weight: 600; cursor: pointer; }
.btn:hover { background: #c01f40; }
.btn:disabled { background: #666; cursor: not-allowed; }
.btn-secondary { background: #333; }
.btn-secondary:hover { background: #444; }
.notification { position: fixed; top: 2rem; right: 2rem; background: #df2b52; color: #fff; padding: 1rem 1.5rem; border-radius: 4px; z-index: 1000; }
.loading { text-align: center; padding: 3rem; color: #999; }
.loading-spinner { border: 4px solid #333; border-top-color: #df2b52; border-radius: 50%; width: 50px; height: 50px; margin: 0 auto 1rem; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.file { display: flex; justify-content: space-between; padding: 0.75rem; background: #000; border: 1px solid #333; border-radius: 4px; margin-bottom: 0.5rem; font-family: monospace; }
.file.dir { border-left: 3px solid #df2b52; }
.file-size { color: #999; font-size: 0.875rem; }
.empty { text-align: center; padding: 3rem; color: #666; }
.divider { border-top: 1px solid #333; margin: 2rem 0; }
.console-toggle { position: fixed !important; bottom: 2rem !important; right: 2rem !important; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #df2b52 0%, #c01f40 100%); color: #fff; border: none; cursor: pointer; font-size: 1.5rem; box-shadow: 0 4px 20px rgba(223, 43, 82, 0.4); z-index: 9999 !important; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
.console-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(223, 43, 82, 0.6); }
.floating-console { position: fixed !important; background: #111; border: 2px solid #df2b52; border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8); z-index: 10000 !important; display: flex; flex-direction: column; }
.floating-console.minimized { height: 45px !important; }
.floating-console.maximized { top: 20px !important; left: 20px !important; right: 20px !important; bottom: 20px !important; width: auto !important; height: auto !important; }
.console-header { background: #df2b52; color: #fff; padding: 0.75rem 1rem; cursor: move; display: flex; justify-content: space-between; align-items: center; user-select: none; border-radius: 6px 6px 0 0; }
.console-header-title { font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
.console-controls { display: flex; gap: 0.5rem; }
.console-control-btn { background: rgba(255, 255, 255, 0.2); border: none; color: #fff; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.console-control-btn:hover { background: rgba(255, 255, 255, 0.3); }
.console-body { flex: 1; overflow-y: auto; padding: 1rem; background: #000; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 0.8rem; line-height: 1.5; }
.console-body::-webkit-scrollbar { width: 8px; }
.console-body::-webkit-scrollbar-track { background: #111; }
.console-body::-webkit-scrollbar-thumb { background: #df2b52; border-radius: 4px; }
.console-log { margin-bottom: 0.5rem; padding: 0.5rem; border-left: 3px solid transparent; border-radius: 2px; transition: background 0.2s; }
.console-log:hover { background: #1a1a1a; }
.console-log.info { border-left-color: #74c0fc; }
.console-log.success { border-left-color: #51cf66; }
.console-log.error { border-left-color: #ff6b6b; }
.console-log.stderr { border-left-color: #ffa94d; }
.console-log.stdout { border-left-color: #74c0fc; }
.console-log-time { color: #666; margin-right: 0.75rem; font-size: 0.75rem; }
.console-log-type { color: #df2b52; font-weight: 600; margin-right: 0.75rem; min-width: 60px; display: inline-block; font-size: 0.75rem; }
.console-log-message { color: #e0e0e0; word-break: break-word; }
.console-empty { color: #666; text-align: center; padding: 3rem 1rem; font-size: 0.9rem; }
.console-resize-handle { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; }
.console-resize-handle::after { content: ''; position: absolute; bottom: 2px; right: 2px; width: 0; height: 0; border-style: solid; border-width: 0 0 8px 8px; border-color: transparent transparent #df2b52 transparent; }`;
  }

  private getApp() {
    return `const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function App() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [consoleOpen, setConsoleOpen] = useState(true);

  useEffect(() => { 
    console.log('Kubit Forge GUI App mounted');
    console.log('Console open state:', true);
    loadData(); 
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function notify(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }

  if (loading) {
    return React.createElement('div', { className: 'loading' },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('div', null, 'Loading...')
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'header' },
      React.createElement('h1', null, 'Kubit Forge'),
      React.createElement('p', null, 'Advanced Project Manager')
    ),
    React.createElement('div', { className: 'tabs' },
      ['dashboard', 'commands', 'git', 'dependencies', 'features', 'files', 'templates', 'config'].map(t =>
        React.createElement('button', {
          key: t,
          className: 'tab' + (tab === t ? ' active' : ''),
          onClick: () => setTab(t)
        }, t.charAt(0).toUpperCase() + t.slice(1))
      )
    ),
    React.createElement('div', { className: 'content' },
      tab === 'dashboard' && React.createElement(Dashboard, { data, onRefresh: loadData }),
      tab === 'commands' && React.createElement(Commands, { notify }),
      tab === 'git' && React.createElement(Git, { data }),
      tab === 'dependencies' && React.createElement(Dependencies, { notify }),
      tab === 'features' && React.createElement(Features, { notify }),
      tab === 'files' && React.createElement(Files, {}),
      tab === 'templates' && React.createElement(Templates, { notify }),
      tab === 'config' && React.createElement(Config, { notify })
    ),
    notification && React.createElement('div', { className: 'notification' }, notification),
    React.createElement('button', {
      className: 'console-toggle',
      onClick: () => setConsoleOpen(!consoleOpen),
      title: consoleOpen ? 'Close Console' : 'Open Console'
    }, consoleOpen ? '✕' : '🖥'),
    consoleOpen && React.createElement(FloatingConsole, { onClose: () => setConsoleOpen(false) })
  );
}

function Dashboard({ data, onRefresh }) {
  const stats = data?.stats || {};
  const git = data?.gitStatus || {};

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Dashboard'),
    React.createElement('div', { className: 'grid' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'stat-value' }, stats.name || 'N/A'),
        React.createElement('div', { className: 'stat-label' }, 'Project')
      ),
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'stat-value' }, stats.version || '0.0.0'),
        React.createElement('div', { className: 'stat-label' }, 'Version')
      ),
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'stat-value' }, stats.dependencies || 0),
        React.createElement('div', { className: 'stat-label' }, 'Dependencies')
      ),
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'stat-value' }, stats.devDependencies || 0),
        React.createElement('div', { className: 'stat-label' }, 'Dev Dependencies')
      )
    ),
    React.createElement('div', { className: 'divider' }),
    React.createElement('div', { className: 'git-info' },
      React.createElement('div', null,
        'Branch: ',
        React.createElement('span', { className: 'git-branch' }, git.branch || 'N/A')
      ),
      React.createElement('div', null, 'Changes: ', git.changes || 0),
      React.createElement('div', null, 'Status: ', git.clean ? '✓ Clean' : '⚠ Modified')
    ),
    React.createElement('button', { className: 'btn', onClick: onRefresh, style: { marginTop: '1rem' } }, 'Refresh')
  );
}

function Commands({ notify }) {
  const [running, setRunning] = useState({});
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    fetch('/api/commands/available')
      .then(r => r.json())
      .then(d => setCommands(d.commands || []))
      .catch(console.error);
  }, []);

  async function runCommand(cmd) {
    setRunning(prev => ({ ...prev, [cmd]: true }));
    try {
      const res = await fetch('/api/command/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      notify(data.success ? \`✓ \${cmd} completed\` : \`✗ \${cmd} failed\`);
    } catch (err) {
      notify(\`✗ Error: \${err.message}\`);
    } finally {
      setRunning(prev => ({ ...prev, [cmd]: false }));
    }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Commands'),
    commands.length === 0 
      ? React.createElement('div', { className: 'loading' }, 'Loading commands...')
      : React.createElement('div', { className: 'grid' },
          commands.map(cmd =>
            React.createElement('div', {
              key: cmd.name,
              className: 'card clickable',
              onClick: () => !running[cmd.name] && runCommand(cmd.name)
            },
              React.createElement('div', { className: 'card-title' }, cmd.name),
              React.createElement('div', { className: 'card-desc', style: { fontSize: '0.75rem', fontFamily: 'monospace' } }, cmd.description),
              running[cmd.name] && React.createElement('div', { style: { marginTop: '0.5rem', color: '#df2b52' } }, 'Running...')
            )
          )
        )
  );
}

function FloatingConsole({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize position on first render
  useEffect(() => {
    console.log('FloatingConsole mounted');
    if (!initialized && typeof window !== 'undefined') {
      const initialX = Math.max(50, window.innerWidth - 720);
      const initialY = Math.max(50, window.innerHeight - 550);
      console.log('Setting console position:', { x: initialX, y: initialY });
      setPosition({ x: initialX, y: initialY });
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    console.log('Loading logs...');
    loadLogs();
    const interval = setInterval(loadLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logs.length > 0) {
      const consoleBody = document.querySelector('.console-body');
      if (consoleBody) {
        consoleBody.scrollTop = consoleBody.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  useEffect(() => {
    if (dragging) {
      const handleMouseMove = (e) => {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      };
      const handleMouseUp = () => setDragging(false);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

  useEffect(() => {
    if (resizing) {
      const handleMouseMove = (e) => {
        setSize({
          width: Math.max(400, e.clientX - position.x),
          height: Math.max(300, e.clientY - position.y)
        });
      };
      const handleMouseUp = () => setResizing(false);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, position]);

  async function loadLogs() {
    try {
      const res = await fetch('/api/console/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }

  async function clearLogs() {
    try {
      await fetch('/api/console/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  }

  function handleMouseDown(e) {
    if (e.target.closest('.console-controls') || e.target.closest('.console-resize-handle')) return;
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }

  function toggleMinimize() {
    setMinimized(!minimized);
    if (maximized) setMaximized(false);
  }

  function toggleMaximize() {
    setMaximized(!maximized);
    if (minimized) setMinimized(false);
  }

  function getLogColor(type) {
    switch(type) {
      case 'error': return '#ff6b6b';
      case 'success': return '#51cf66';
      case 'stderr': return '#ffa94d';
      case 'stdout': return '#74c0fc';
      case 'info': return '#999';
      default: return '#fff';
    }
  }

  const consoleStyle = maximized 
    ? {} 
    : { 
        left: position.x + 'px', 
        top: position.y + 'px', 
        width: size.width + 'px', 
        height: size.height + 'px' 
      };

  return React.createElement('div', {
    className: 'floating-console' + (minimized ? ' minimized' : '') + (maximized ? ' maximized' : ''),
    style: consoleStyle
  },
    React.createElement('div', {
      className: 'console-header',
      onMouseDown: handleMouseDown
    },
      React.createElement('div', { className: 'console-header-title' },
        React.createElement('span', null, '🖥'),
        React.createElement('span', null, 'Console'),
        React.createElement('span', { style: { fontSize: '0.75rem', color: '#fffa', marginLeft: '0.5rem' } }, 
          \`(\${logs.length} logs)\`)
      ),
      React.createElement('div', { className: 'console-controls' },
        React.createElement('button', {
          className: 'console-control-btn',
          onClick: clearLogs,
          title: 'Clear logs'
        }, '🗑'),
        React.createElement('button', {
          className: 'console-control-btn',
          onClick: loadLogs,
          title: 'Refresh'
        }, '↻'),
        React.createElement('button', {
          className: 'console-control-btn',
          onClick: toggleMinimize,
          title: minimized ? 'Restore' : 'Minimize'
        }, minimized ? '□' : '_'),
        React.createElement('button', {
          className: 'console-control-btn',
          onClick: toggleMaximize,
          title: maximized ? 'Restore' : 'Maximize'
        }, maximized ? '◱' : '□'),
        React.createElement('button', {
          className: 'console-control-btn',
          onClick: onClose,
          title: 'Close'
        }, '✕')
      )
    ),
    !minimized && React.createElement('div', { className: 'console-body' },
      logs.length === 0
        ? React.createElement('div', { className: 'console-empty' }, 
            '📟 No logs yet',
            React.createElement('br'),
            React.createElement('small', { style: { fontSize: '0.8rem' } }, 'Execute a command to see output here')
          )
        : logs.map((log, i) =>
            React.createElement('div', { 
              key: i,
              className: \`console-log \${log.type}\`
            },
              React.createElement('span', { className: 'console-log-time' }, 
                new Date(log.timestamp).toLocaleTimeString()
              ),
              React.createElement('span', { className: 'console-log-type' }, 
                \`[\${log.type.toUpperCase()}]\`
              ),
              React.createElement('span', { 
                className: 'console-log-message',
                style: { color: getLogColor(log.type) }
              }, log.message)
            )
          )
    ),
    !minimized && !maximized && React.createElement('div', {
      className: 'console-resize-handle',
      onMouseDown: (e) => {
        e.stopPropagation();
        setResizing(true);
      }
    })
  );
}

function Console() {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadLogs() {
    try {
      const res = await fetch('/api/console/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function clearLogs() {
    try {
      await fetch('/api/console/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error(err);
    }
  }

  function getLogColor(type) {
    switch(type) {
      case 'error': return '#ff6b6b';
      case 'success': return '#51cf66';
      case 'stderr': return '#ffa94d';
      case 'stdout': return '#74c0fc';
      case 'info': return '#999';
      default: return '#fff';
    }
  }

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' } },
      React.createElement('h2', { className: 'title', style: { marginBottom: 0 } }, 'Console'),
      React.createElement('div', { style: { display: 'flex', gap: '1rem', alignItems: 'center' } },
        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
          React.createElement('input', {
            type: 'checkbox',
            checked: autoScroll,
            onChange: e => setAutoScroll(e.target.checked),
            className: 'form-checkbox'
          }),
          'Auto-scroll'
        ),
        React.createElement('button', { className: 'btn-secondary btn', onClick: clearLogs }, 'Clear'),
        React.createElement('button', { className: 'btn-secondary btn', onClick: loadLogs }, 'Refresh')
      )
    ),
    React.createElement('div', { 
      className: 'console-output',
      style: { 
        background: '#000',
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '1rem',
        height: '500px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.875rem'
      }
    },
      logs.length === 0
        ? React.createElement('div', { style: { color: '#666', textAlign: 'center', paddingTop: '2rem' } }, 'No logs yet. Execute a command to see output here.')
        : logs.map((log, i) =>
            React.createElement('div', { 
              key: i,
              style: { 
                marginBottom: '0.5rem',
                color: getLogColor(log.type),
                borderBottom: '1px solid #222',
                paddingBottom: '0.5rem'
              }
            },
              React.createElement('span', { style: { color: '#666', marginRight: '1rem' } }, new Date(log.timestamp).toLocaleTimeString()),
              React.createElement('span', { style: { color: '#df2b52', marginRight: '1rem' } }, \`[\${log.type}]\`),
              React.createElement('span', null, log.message)
            )
          )
    )
  );
}

function Git({ data }) {
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    fetch('/api/git/commits')
      .then(r => r.json())
      .then(d => setCommits(d.commits || []))
      .catch(console.error);
  }, []);

  const git = data?.gitStatus || {};

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Git'),
    React.createElement('div', { className: 'git-info' },
      React.createElement('div', null, 'Branch: ', React.createElement('span', { className: 'git-branch' }, git.branch || 'N/A')),
      React.createElement('div', null, 'Changes: ', git.changes || 0)
    ),
    React.createElement('h3', { className: 'title', style: { marginTop: '2rem', fontSize: '1.25rem' } }, 'Recent Commits'),
    commits.length === 0
      ? React.createElement('div', { className: 'empty' }, 'No commits found')
      : commits.map(c =>
          React.createElement('div', { key: c.hash, className: 'commit' },
            React.createElement('span', { className: 'commit-hash' }, c.hash),
            React.createElement('span', null, c.message)
          )
        )
  );
}

function Dependencies({ notify }) {
  const [deps, setDeps] = useState({ dependencies: [], devDependencies: [] });

  useEffect(() => {
    fetch('/api/dependencies')
      .then(r => r.json())
      .then(setDeps)
      .catch(console.error);
  }, []);

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Dependencies'),
    React.createElement('h3', { style: { marginBottom: '1rem', color: '#df2b52' } }, 'Production (', deps.dependencies.length, ')'),
    React.createElement('div', { className: 'deps' },
      deps.dependencies.map(d =>
        React.createElement('div', { key: d, className: 'dep prod' }, d)
      )
    ),
    React.createElement('h3', { style: { marginTop: '2rem', marginBottom: '1rem', color: '#666' } }, 'Development (', deps.devDependencies.length, ')'),
    React.createElement('div', { className: 'deps' },
      deps.devDependencies.map(d =>
        React.createElement('div', { key: d, className: 'dep dev' }, d)
      )
    )
  );
}

function Features({ notify }) {
  const [features, setFeatures] = useState([]);
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then(d => setFeatures(d.features || []))
      .catch(console.error);
  }, []);

  async function install(id) {
    setInstalling(id);
    notify(\`🔧 Installing "\${id}"... Check console for progress\`);
    
    try {
      const res = await fetch('/api/feature/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: id })
      });
      const data = await res.json();
      
      if (data.success) {
        notify(\`✅ Feature "\${id}" installed successfully!\`);
      } else {
        notify(\`❌ Failed to install "\${id}": \${data.error || 'Unknown error'}\`);
      }
    } catch (err) {
      notify(\`❌ Error: \${err.message}\`);
    } finally {
      setInstalling(null);
    }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Add Features'),
    React.createElement('p', { style: { color: '#999', marginBottom: '2rem' } },
      'Add features to your project. Watch the floating console for installation progress.'
    ),
    features.length === 0
      ? React.createElement('div', { className: 'empty' }, 'No features available')
      : React.createElement('div', { className: 'grid' },
          features.map(f =>
            React.createElement('div', { key: f.id, className: 'card' },
              React.createElement('div', { className: 'card-title' }, f.name),
              React.createElement('div', { className: 'card-desc' }, f.description),
              React.createElement('button', {
                className: 'btn',
                onClick: () => install(f.id),
                disabled: installing === f.id,
                style: { marginTop: '1rem', width: '100%' }
              }, installing === f.id ? '⏳ Installing...' : '➕ Install'),
              installing === f.id && React.createElement('div', { 
                style: { 
                  marginTop: '0.75rem', 
                  padding: '0.5rem', 
                  background: '#000', 
                  borderRadius: '4px',
                  borderLeft: '3px solid #df2b52',
                  color: '#999',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                } 
              }, '🖥️ Installing... Check console')
            )
          )
        )
  );
}

function Files() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch('/api/files')
      .then(r => r.json())
      .then(d => setFiles(d.files || []))
      .catch(console.error);
  }, []);

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Files'),
    files.length === 0
      ? React.createElement('div', { className: 'empty' }, 'No files found')
      : files.map(f =>
          React.createElement('div', { key: f.name, className: 'file' + (f.type === 'directory' ? ' dir' : '') },
            React.createElement('span', null, f.type === 'directory' ? '📁 ' : '📄 ', f.name),
            f.size > 0 && React.createElement('span', { className: 'file-size' }, (f.size / 1024).toFixed(1), ' KB')
          )
        )
  );
}

function Templates({ notify }) {
  const [templates, setTemplates] = useState([]);
  const [names, setNames] = useState({});
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(console.error);
  }, []);

  function updateName(templateId, value) {
    setNames(prev => ({ ...prev, [templateId]: value }));
  }

  async function create(templateId) {
    const name = names[templateId] || '';
    
    if (!name.trim()) {
      notify('⚠️ Please enter a project name');
      return;
    }

    // Validate project name
    if (!/^[a-z0-9-]+$/.test(name)) {
      notify('⚠️ Project name must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    setCreating(templateId);
    notify(\`🚀 Creating "\${name}" from \${templateId} template... Check console for progress\`);

    try {
      const res = await fetch('/api/template/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          template: templateId, 
          name: name.trim()
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        notify(\`✅ Project "\${name}" created successfully!\`);
        // Clear the input after successful creation
        setNames(prev => ({ ...prev, [templateId]: '' }));
      } else {
        notify(\`❌ Failed to create project: \${data.error || 'Unknown error'}\`);
      }
    } catch (err) {
      notify(\`❌ Error: \${err.message}\`);
    } finally {
      setCreating(null);
    }
  }

  function handleKeyPress(e, templateId) {
    if (e.key === 'Enter' && !creating) {
      create(templateId);
    }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Create from Template'),
    React.createElement('p', { style: { color: '#999', marginBottom: '2rem' } },
      'Create a new project using one of the available templates. Watch the floating console for real-time progress.'
    ),
    templates.length === 0
      ? React.createElement('div', { className: 'empty' }, 'No templates available')
      : templates.map(t =>
          React.createElement('div', { key: t.id, className: 'card', style: { marginBottom: '1rem' } },
            React.createElement('div', { className: 'card-title' }, t.name),
            React.createElement('div', { className: 'card-desc', style: { marginBottom: '1rem' } }, t.description),
            React.createElement('div', { style: { display: 'flex', gap: '1rem', alignItems: 'center' } },
              React.createElement('input', {
                className: 'form-input',
                placeholder: 'my-awesome-project',
                value: names[t.id] || '',
                onChange: e => updateName(t.id, e.target.value),
                onKeyPress: e => handleKeyPress(e, t.id),
                disabled: creating === t.id,
                style: { flex: 1 }
              }),
              React.createElement('button', { 
                className: 'btn', 
                onClick: () => create(t.id),
                disabled: creating === t.id || !names[t.id]?.trim(),
                style: { minWidth: '120px' }
              }, creating === t.id ? '⏳ Creating...' : '🚀 Create')
            ),
            creating === t.id && React.createElement('div', { 
              style: { 
                marginTop: '0.75rem', 
                padding: '0.75rem', 
                background: '#000', 
                borderRadius: '4px',
                borderLeft: '3px solid #df2b52',
                color: '#999',
                fontSize: '0.875rem'
              } 
            }, '🖥️ Creating project... Open the floating console to see progress')
          )
        )
  );
}

function Config({ notify }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => setConfig(d.config))
      .catch(console.error);
  }, []);

  async function save() {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      notify(data.success ? '✓ Config saved' : '✗ Save failed');
    } catch (err) {
      notify(\`✗ Error: \${err.message}\`);
    }
  }

  function update(section, key, value) {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  }

  if (!config) return React.createElement('div', { className: 'loading' }, 'Loading...');

  return React.createElement('div', null,
    React.createElement('h2', { className: 'title' }, 'Configuration'),
    React.createElement('div', { className: 'card', style: { marginBottom: '1rem' } },
      React.createElement('h3', { style: { marginBottom: '1rem' } }, 'Project'),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Name'),
        React.createElement('input', {
          className: 'form-input',
          value: config.project.name,
          onChange: e => update('project', 'name', e.target.value)
        })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Stack'),
        React.createElement('select', {
          className: 'form-select',
          value: config.project.stack,
          onChange: e => update('project', 'stack', e.target.value)
        },
          React.createElement('option', { value: 'react' }, 'React'),
          React.createElement('option', { value: 'vanilla' }, 'Vanilla')
        )
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Package Manager'),
        React.createElement('select', {
          className: 'form-select',
          value: config.project.packageManager,
          onChange: e => update('project', 'packageManager', e.target.value)
        },
          React.createElement('option', { value: 'pnpm' }, 'pnpm'),
          React.createElement('option', { value: 'npm' }, 'npm'),
          React.createElement('option', { value: 'yarn' }, 'yarn')
        )
      )
    ),
    config.quality && React.createElement('div', { className: 'card', style: { marginBottom: '1rem' } },
      React.createElement('h3', { style: { marginBottom: '1rem' } }, 'Quality'),
      ['lint', 'format', 'typecheck', 'unitTest'].map(key =>
        React.createElement('div', { key, className: 'checkbox-group' },
          React.createElement('input', {
            type: 'checkbox',
            className: 'form-checkbox',
            checked: config.quality[key],
            onChange: e => update('quality', key, e.target.checked)
          }),
          React.createElement('label', null, key.charAt(0).toUpperCase() + key.slice(1))
        )
      )
    ),
    React.createElement('button', { className: 'btn', onClick: save }, 'Save Configuration')
  );
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));`;
  }
}

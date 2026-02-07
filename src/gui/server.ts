import type { IncomingMessage, ServerResponse } from 'http';

import { createServer } from 'http';

import type { KubitConfig, Logger } from '../types/index.js';

export interface GuiServerOptions {
  port?: number;
  host?: string;
  open?: boolean;
  config: KubitConfig;
  cwd: string;
  logger: Logger;
}

export class GuiServer {
  private server: any;
  private port: number;
  private host: string;
  private config: KubitConfig;
  private cwd: string;
  private logger: Logger;

  constructor(options: GuiServerOptions) {
    this.port = options.port || 3030;
    this.host = options.host || 'localhost';
    this.config = options.config;
    this.cwd = options.cwd;
    this.logger = options.logger;
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
        this.logger.success(`\n🎨 Kubit Forge GUI running at: ${url}\n`);
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
      this.serveHtml(res);
    } else if (url === '/styles.css') {
      this.serveCss(res);
    } else if (url === '/app.js') {
      this.serveJs(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  private handleApiRequest(url: string, req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url === '/api/config') {
      // GET config
      if (req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ config: this.config, cwd: this.cwd }));
        return;
      }

      // POST config (update)
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const updatedConfig = JSON.parse(body);
            // In a real implementation, this would write to kubit.config.toml
            res.writeHead(200);
            res.end(JSON.stringify({ config: updatedConfig, success: true }));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
    }

    if (url === '/api/project/info') {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          cwd: this.cwd,
          language: this.config.project.language,
          name: this.config.project.name,
          packageManager: this.config.project.packageManager,
          stack: this.config.project.stack,
        })
      );
      return;
    }

    if (url === '/api/commands') {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          commands: [
            { description: 'Start development server', icon: '🚀', name: 'dev' },
            { description: 'Build for production', icon: '🏗️', name: 'build' },
            { description: 'Run tests', icon: '🧪', name: 'test' },
            { description: 'Lint code', icon: '🔍', name: 'lint' },
            { description: 'Format code', icon: '✨', name: 'format' },
            { description: 'Type check', icon: '📘', name: 'typecheck' },
          ],
        })
      );
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  private serveHtml(res: ServerResponse): void {
    const html = this.generateHtml();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  private serveCss(res: ServerResponse): void {
    const css = this.generateCss();
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(css);
  }

  private serveJs(res: ServerResponse): void {
    const js = this.generateJs();
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(js);
  }

  private generateHtml(): string {
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

  private generateCss(): string {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #fff;
}

#root {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeIn 0.6s ease-in;
}

.app-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1rem;
}

.tab {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tab.active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.4s ease-out;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #fff;
}

.info-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.command-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.command-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.command-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.command-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.command-desc {
  opacity: 0.9;
  font-size: 0.875rem;
}

.config-editor {
  display: grid;
  gap: 1.5rem;
}

.config-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
}

.config-section-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.form-checkbox {
  width: auto;
  margin-right: 0.5rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.save-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}`;
  }

  private generateJs(): string {
    return `const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projectInfo, setProjectInfo] = useState(null);
  const [commands, setCommands] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [infoRes, commandsRes, configRes] = await Promise.all([
        fetch('/api/project/info'),
        fetch('/api/commands'),
        fetch('/api/config')
      ]);

      const info = await infoRes.json();
      const cmds = await commandsRes.json();
      const cfg = await configRes.json();

      setProjectInfo(info);
      setCommands(cmds.commands);
      setConfig(cfg.config);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  }

  async function handleSaveConfig() {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  function updateConfig(section, key, value) {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }

  if (loading) {
    return React.createElement('div', { className: 'loading' },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('div', null, 'Loading Kubit Forge...')
    );
  }

  return React.createElement('div', null,
    React.createElement('header', { className: 'app-header' },
      React.createElement('h1', { className: 'app-title' }, '⚡ Kubit Forge GUI'),
      React.createElement('p', { className: 'app-subtitle' }, 'Modern Web Development Dashboard')
    ),

    React.createElement('div', { className: 'tabs' },
      React.createElement('button', {
        className: 'tab' + (activeTab === 'overview' ? ' active' : ''),
        onClick: () => setActiveTab('overview')
      }, '📊 Overview'),
      React.createElement('button', {
        className: 'tab' + (activeTab === 'commands' ? ' active' : ''),
        onClick: () => setActiveTab('commands')
      }, '⚡ Commands'),
      React.createElement('button', {
        className: 'tab' + (activeTab === 'config' ? ' active' : ''),
        onClick: () => setActiveTab('config')
      }, '⚙️ Configuration')
    ),

    React.createElement('div', { className: 'content-card' },
      activeTab === 'overview' && React.createElement(OverviewTab, { projectInfo }),
      activeTab === 'commands' && React.createElement(CommandsTab, { commands }),
      activeTab === 'config' && React.createElement(ConfigTab, { config, updateConfig, onSave: handleSaveConfig })
    ),

    saved && React.createElement('div', { className: 'save-notification' },
      '✓ Configuration saved successfully!'
    )
  );
}

function OverviewTab({ projectInfo }) {
  return React.createElement('div', null,
    React.createElement('h2', { className: 'section-title' }, 'Project Overview'),
    React.createElement('div', { className: 'info-grid' },
      React.createElement('div', { className: 'info-item' },
        React.createElement('div', { className: 'info-label' }, 'Project Name'),
        React.createElement('div', { className: 'info-value' }, projectInfo.name)
      ),
      React.createElement('div', { className: 'info-item' },
        React.createElement('div', { className: 'info-label' }, 'Stack'),
        React.createElement('div', { className: 'info-value' }, projectInfo.stack)
      ),
      React.createElement('div', { className: 'info-item' },
        React.createElement('div', { className: 'info-label' }, 'Language'),
        React.createElement('div', { className: 'info-value' }, projectInfo.language.toUpperCase())
      ),
      React.createElement('div', { className: 'info-item' },
        React.createElement('div', { className: 'info-label' }, 'Package Manager'),
        React.createElement('div', { className: 'info-value' }, projectInfo.packageManager)
      )
    ),
    React.createElement('div', { className: 'info-item', style: { marginTop: '1rem' } },
      React.createElement('div', { className: 'info-label' }, 'Working Directory'),
      React.createElement('div', { className: 'info-value', style: { fontSize: '1rem', wordBreak: 'break-all' } }, projectInfo.cwd)
    )
  );
}

function CommandsTab({ commands }) {
  return React.createElement('div', null,
    React.createElement('h2', { className: 'section-title' }, 'Available Commands'),
    React.createElement('div', { className: 'commands-grid' },
      commands.map((cmd, i) =>
        React.createElement('div', { key: i, className: 'command-card' },
          React.createElement('div', { className: 'command-icon' }, cmd.icon),
          React.createElement('div', { className: 'command-name' }, 'kubit-forge ' + cmd.name),
          React.createElement('div', { className: 'command-desc' }, cmd.description)
        )
      )
    )
  );
}

function ConfigTab({ config, updateConfig, onSave }) {
  if (!config) return null;

  return React.createElement('div', { className: 'config-editor' },
    React.createElement('h2', { className: 'section-title' }, 'Visual Configuration Editor'),

    React.createElement('div', { className: 'config-section' },
      React.createElement('h3', { className: 'config-section-title' }, '🎯 Project Settings'),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Project Name'),
        React.createElement('input', {
          type: 'text',
          className: 'form-input',
          value: config.project.name,
          onChange: (e) => updateConfig('project', 'name', e.target.value)
        })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Stack'),
        React.createElement('select', {
          className: 'form-select',
          value: config.project.stack,
          onChange: (e) => updateConfig('project', 'stack', e.target.value)
        },
          React.createElement('option', { value: 'react' }, 'React'),
          React.createElement('option', { value: 'vanilla' }, 'Vanilla')
        )
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Language'),
        React.createElement('select', {
          className: 'form-select',
          value: config.project.language,
          onChange: (e) => updateConfig('project', 'language', e.target.value)
        },
          React.createElement('option', { value: 'ts' }, 'TypeScript'),
          React.createElement('option', { value: 'js' }, 'JavaScript')
        )
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Package Manager'),
        React.createElement('select', {
          className: 'form-select',
          value: config.project.packageManager,
          onChange: (e) => updateConfig('project', 'packageManager', e.target.value)
        },
          React.createElement('option', { value: 'pnpm' }, 'pnpm'),
          React.createElement('option', { value: 'npm' }, 'npm'),
          React.createElement('option', { value: 'yarn' }, 'yarn')
        )
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label' }, 'Dev Port'),
        React.createElement('input', {
          type: 'number',
          className: 'form-input',
          value: config.project.devPort,
          onChange: (e) => updateConfig('project', 'devPort', parseInt(e.target.value))
        })
      )
    ),

    config.quality && React.createElement('div', { className: 'config-section' },
      React.createElement('h3', { className: 'config-section-title' }, '✨ Quality Settings'),
      React.createElement('div', { className: 'checkbox-group' },
        React.createElement('input', {
          type: 'checkbox',
          className: 'form-checkbox',
          checked: config.quality.lint,
          onChange: (e) => updateConfig('quality', 'lint', e.target.checked)
        }),
        React.createElement('label', { className: 'form-label' }, 'Enable Linting')
      ),
      React.createElement('div', { className: 'checkbox-group' },
        React.createElement('input', {
          type: 'checkbox',
          className: 'form-checkbox',
          checked: config.quality.format,
          onChange: (e) => updateConfig('quality', 'format', e.target.checked)
        }),
        React.createElement('label', { className: 'form-label' }, 'Enable Formatting')
      ),
      React.createElement('div', { className: 'checkbox-group' },
        React.createElement('input', {
          type: 'checkbox',
          className: 'form-checkbox',
          checked: config.quality.typecheck,
          onChange: (e) => updateConfig('quality', 'typecheck', e.target.checked)
        }),
        React.createElement('label', { className: 'form-label' }, 'Enable Type Checking')
      ),
      React.createElement('div', { className: 'checkbox-group' },
        React.createElement('input', {
          type: 'checkbox',
          className: 'form-checkbox',
          checked: config.quality.unitTest,
          onChange: (e) => updateConfig('quality', 'unitTest', e.target.checked)
        }),
        React.createElement('label', { className: 'form-label' }, 'Enable Unit Tests')
      )
    ),

    React.createElement('button', {
      className: 'btn-primary',
      onClick: onSave
    }, '💾 Save Configuration')
  );
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));`;
  }
}

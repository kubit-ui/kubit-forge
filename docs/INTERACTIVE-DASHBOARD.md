# Interactive Dashboard

## Overview

The Kubit Forge Interactive Dashboard is a beautiful Terminal User Interface (TUI) that provides real-time project management, command execution, and system monitoring directly in your terminal.

## Quick Start

```bash
# Launch dashboard
kubit-forge dashboard

# Launch with custom config
kubit-forge dashboard --refresh 1000

# Launch in read-only mode
kubit-forge dashboard --read-only
```

## Dashboard Views

### 1. Overview View

The main dashboard showing project status and quick actions.

```
╔═══════════════════════════════════════════════════════════════════╗
║                    KUBIT FORGE DASHBOARD                         ║
║                                                                   ║
║  Project: my-awesome-app                     Status: ● Healthy   ║
║  Stack: React + TypeScript                   Version: 1.0.0      ║
║  Package Manager: pnpm                                            ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ Quick Actions                                               │ ║
║  │                                                             │ ║
║  │  [1] Start Dev Server        [4] Run Linter               │ ║
║  │  [2] Build Production        [5] Run Tests                │ ║
║  │  [3] Format Code             [6] Type Check               │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  Recent Activity:                                                 ║
║  ✓ Build completed successfully (2m ago)                         ║
║  ✓ Tests passed (5m ago)                                         ║
║  ⚠ 2 linting warnings detected (10m ago)                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

[1-5] Views | [a] Actions | [q] Quit
```

**Features:**

- Project information at a glance
- Health status indicator
- Quick action buttons
- Recent activity timeline
- Keyboard shortcuts

### 2. Commands View

Execute common commands with visual feedback.

```
╔═══════════════════════════════════════════════════════════════════╗
║                       AVAILABLE COMMANDS                          ║
║                                                                   ║
║  Development                                                      ║
║  ● dev              Start development server                     ║
║  ● build            Build for production                         ║
║  ● test             Run test suite                               ║
║                                                                   ║
║  Quality                                                          ║
║  ● lint             Run ESLint                                   ║
║  ● format           Format with Prettier                         ║
║  ● typecheck        TypeScript type checking                     ║
║  ● check            Run all quality checks                       ║
║                                                                   ║
║  Tools                                                            ║
║  ● doctor           AI-powered diagnostics                       ║
║  ● deps:analyze     Analyze dependencies                         ║
║  ● info             Show project information                     ║
║                                                                   ║
║  > Run: dev                                                       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

[↑↓] Navigate | [Enter] Execute | [Esc] Back
```

**Features:**

- Command list with descriptions
- Category organization
- Command execution with real-time output
- Command history
- Auto-completion

### 3. Plugins View

Manage installed plugins visually.

```
╔═══════════════════════════════════════════════════════════════════╗
║                      INSTALLED PLUGINS                            ║
║                                                                   ║
║  ✓ @kubit/plugin-analytics                           v1.2.0      ║
║    Real-time analytics integration                                ║
║    Status: Active | Size: 245KB                                   ║
║    [Disable] [Configure] [Remove]                                 ║
║                                                                   ║
║  ✓ @kubit/plugin-sentry                              v2.1.0      ║
║    Error tracking and monitoring                                  ║
║    Status: Active | Size: 180KB                                   ║
║    [Disable] [Configure] [Remove]                                 ║
║                                                                   ║
║  ○ @kubit/plugin-monitoring                          v1.0.0      ║
║    Performance monitoring                                         ║
║    Status: Disabled | Size: 320KB                                 ║
║    [Enable] [Configure] [Remove]                                  ║
║                                                                   ║
║  Available Plugins: 12                                            ║
║  [i] Install New Plugin                                           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

[↑↓] Navigate | [Space] Toggle | [i] Install | [Esc] Back
```

**Features:**

- List all installed plugins
- Enable/disable plugins
- Plugin configuration
- Install new plugins
- Plugin statistics

### 4. Logs View

Stream real-time logs and command output.

```
╔═══════════════════════════════════════════════════════════════════╗
║                          LIVE LOGS                                ║
║                                                                   ║
║  [12:34:56] INFO  Starting dev server...                         ║
║  [12:34:57] INFO  ✓ TypeScript compiled successfully             ║
║  [12:34:58] INFO  ✓ ESLint passed                                ║
║  [12:34:59] WARN  Large bundle size detected (2.5MB)             ║
║  [12:35:00] INFO  Dev server running at http://localhost:3000    ║
║  [12:35:01] INFO  ✓ HMR connected                                ║
║  [12:35:02] INFO  Page /home requested                           ║
║  [12:35:03] INFO  Component <Button> rendered                    ║
║  [12:35:04] ERROR Failed to load module ./missing.ts             ║
║  [12:35:05] INFO  Hot update applied                             ║
║                                                                   ║
║  Filters: [INFO] [WARN] [ERROR]                                  ║
║  Auto-scroll: ON | Lines: 156                                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

[↑↓] Scroll | [f] Filter | [c] Clear | [s] Save | [Esc] Back
```

**Features:**

- Real-time log streaming
- Log level filtering (INFO, WARN, ERROR)
- Timestamps
- Color-coded messages
- Search and filter
- Export logs
- Auto-scroll toggle

### 5. System View

Monitor system resources and performance.

```
╔═══════════════════════════════════════════════════════════════════╗
║                      SYSTEM INFORMATION                           ║
║                                                                   ║
║  CPU Usage                                    [████████░░] 75%   ║
║  Memory Usage                                 [██████░░░░] 60%   ║
║  Disk Usage                                   [████░░░░░░] 45%   ║
║                                                                   ║
║  Process Information:                                             ║
║  ● Node.js Version: v20.10.0                                     ║
║  ● Process ID: 12345                                             ║
║  ● Uptime: 2h 34m 12s                                            ║
║  ● Memory: 512MB / 2GB                                           ║
║                                                                   ║
║  Network:                                                         ║
║  ● Dev Server: localhost:3000 (Running)                          ║
║  ● GUI Server: localhost:3456 (Running)                          ║
║                                                                   ║
║  Environment:                                                     ║
║  ● NODE_ENV: development                                         ║
║  ● Platform: darwin (macOS)                                      ║
║  ● Architecture: arm64                                           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

[r] Refresh | [k] Kill Process | [Esc] Back
```

**Features:**

- Real-time CPU and memory monitoring
- Disk usage
- Process information
- Network status
- Environment variables
- System metrics history

## Navigation

### Keyboard Shortcuts

| Key         | Action               |
| ----------- | -------------------- |
| `1-5`       | Switch between views |
| `↑` `↓`     | Navigate items       |
| `←` `→`     | Navigate tabs        |
| `Enter`     | Execute/Select       |
| `Space`     | Toggle               |
| `Tab`       | Next field           |
| `Shift+Tab` | Previous field       |
| `a`         | Quick actions menu   |
| `s`         | Search/Filter        |
| `r`         | Refresh              |
| `c`         | Clear                |
| `h`         | Help                 |
| `q`         | Quit                 |
| `Esc`       | Back/Cancel          |

### Mouse Support

The dashboard supports mouse interaction:

- Click to select items
- Scroll to navigate long lists
- Click buttons to execute actions
- Drag to resize panels (if supported)

## Configuration

### Dashboard Settings

```toml
# kubit.config.toml

[dashboard]
enabled = true
refreshInterval = 2000  # milliseconds
theme = "dark"         # dark, light, auto
showSystemMetrics = true
logLevel = "info"      # debug, info, warn, error

[dashboard.views]
default = "overview"
enabled = ["overview", "commands", "plugins", "logs", "system"]

[dashboard.shortcuts]
quit = "q"
help = "h"
refresh = "r"
```

### Launch Options

```bash
# Custom refresh rate
kubit-forge dashboard --refresh 1000

# Specific view
kubit-forge dashboard --view commands

# Read-only mode
kubit-forge dashboard --read-only

# Light theme
kubit-forge dashboard --theme light

# Disable mouse
kubit-forge dashboard --no-mouse
```

## Features

### Real-time Updates

All metrics and logs update automatically without manual refresh.

### Command Execution

Execute any Kubit Forge command from the dashboard with visual feedback.

```bash
# From dashboard, press '1' then select command
> dev

Starting development server...
✓ TypeScript compiled
✓ ESLint passed
✓ Server running at http://localhost:3000
```

### Plugin Management

Install, enable, disable, and configure plugins visually.

### Live Logs

Stream logs from running processes in real-time with filtering.

### System Monitoring

Track CPU, memory, disk, and network usage.

### Session Persistence

Dashboard state persists across sessions:

- Last viewed tab
- Filter preferences
- Window size
- Custom settings

## Advanced Usage

### Custom Views

Create custom dashboard views:

```typescript
// .kubit/dashboard/custom-view.ts
export default {
  name: 'custom',
  title: 'Custom View',

  render: (ctx) => {
    return {
      content: 'Custom dashboard content',
      // ... rendering logic
    };
  },

  onKeyPress: (key) => {
    // Handle key presses
  },
};
```

### Dashboard API

Programmatic access to dashboard:

```typescript
import { Dashboard } from 'kubit-forge';

const dashboard = new Dashboard({
  refreshInterval: 1000,
  theme: 'dark',
});

// Add custom widget
dashboard.addWidget({
  id: 'custom-widget',
  title: 'Custom Widget',
  render: () => '...',
});

// Launch
await dashboard.start();
```

### Integration with CI/CD

Use dashboard in CI environments:

```bash
# Non-interactive mode for CI
kubit-forge dashboard --ci --output json

# Generate dashboard report
kubit-forge dashboard --report --output dashboard-report.html
```

## Best Practices

### 1. Use for Development

Launch dashboard during development for quick access to commands and logs.

```bash
# In one terminal
kubit-forge dashboard

# Dashboard manages your dev workflow
```

### 2. Monitor System Resources

Keep an eye on CPU and memory usage to optimize performance.

### 3. Check Logs Regularly

Use the logs view to catch warnings and errors early.

### 4. Manage Plugins

Enable only necessary plugins to reduce overhead.

### 5. Customize Shortcuts

Configure keyboard shortcuts to match your workflow.

## Examples

### Daily Development Workflow

```bash
# 1. Launch dashboard
kubit-forge dashboard

# 2. Start dev server (press 1, then 1)
> dev

# 3. Monitor logs (press 4)
> View logs in real-time

# 4. Run tests (press 2, then 3)
> test

# 5. Check system resources (press 5)
> Monitor CPU/Memory
```

### Plugin Management

```bash
# 1. Open plugins view (press 3)
# 2. Browse available plugins
# 3. Install plugin (press i)
# 4. Configure plugin
# 5. Enable/disable as needed
```

### Debugging

```bash
# 1. Open logs view (press 4)
# 2. Filter by ERROR level
# 3. Search for specific error
# 4. Copy error details
# 5. Check stack trace
```

## Troubleshooting

### Dashboard Won't Start

```bash
# Check if port is in use
lsof -i :3456

# Use different port
kubit-forge dashboard --port 4000
```

### Terminal Not Supported

```bash
# Check terminal compatibility
echo $TERM

# Use compatible terminal (iTerm2, Hyper, Windows Terminal)
```

### Performance Issues

```bash
# Reduce refresh rate
kubit-forge dashboard --refresh 5000

# Disable system metrics
kubit-forge dashboard --no-metrics
```

### Rendering Issues

```bash
# Force terminal size
kubit-forge dashboard --width 120 --height 40

# Disable colors
kubit-forge dashboard --no-color
```

## Related Documentation

- [Visual GUI](./VISUAL-GUI.md) - Web-based interface
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - CLI commands
- [Plugin System](./PLUGIN-SYSTEM.md) - Plugin management

---

**Need help?** Run `kubit-forge dashboard --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).

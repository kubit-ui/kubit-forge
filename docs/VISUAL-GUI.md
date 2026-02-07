# Visual GUI & Configuration Editor

## Overview

Kubit Forge provides a modern web-based graphical interface for managing your project visually. Perfect for beginners who prefer clicking over typing commands, or for quick configuration changes.

## Quick Start

```bash
# Launch full GUI dashboard
kubit-forge gui

# Open configuration editor directly
kubit-forge visual:config

# Custom port and host
kubit-forge gui --port 8080 --host 0.0.0.0

# Don't open browser automatically
kubit-forge gui --no-open
```

The GUI will automatically open in your default browser at `http://localhost:3456` (or the specified port).

## Features

### 1. Project Overview

Visual dashboard displaying:

- **Project name** and description
- **Tech stack** (React, Vue, vanilla, etc.)
- **Language** (TypeScript, JavaScript)
- **Package manager** (npm, yarn, pnpm)
- **Node version**
- **Working directory**
- **Quick stats** (dependencies, scripts, file count)

### 2. Command Palette

Execute common commands with one click:

- 🚀 **Start Dev Server** - Launch development server
- 🏗️ **Build Project** - Create production build
- 🧪 **Run Tests** - Execute test suite
- 🔍 **Lint Code** - Check code quality
- ✨ **Format Code** - Auto-format files
- 📊 **Type Check** - Verify TypeScript types
- 🔧 **Doctor** - Run diagnostics

**Visual feedback** shows command status:

- ⏳ Running (animated spinner)
- ✅ Success (green checkmark)
- ❌ Failed (red cross with error message)
- Real-time output in terminal panel

### 3. Visual Configuration Editor

Edit `kubit.config.toml` without touching code:

#### Project Settings

- Project name
- Version
- Description
- Stack selection (dropdown)
- Language selection (dropdown)
- Package manager (npm/yarn/pnpm)

#### Development Options

- Dev server port
- Host address
- Auto-open browser
- Hot Module Replacement (HMR)
- HTTPS enable/disable

#### Quality Settings

- Enable/disable linting
- Enable/disable formatting
- Enable/disable type checking
- Enable/disable tests
- Coverage threshold slider

#### Build Options

- Output directory
- Source maps
- Minification
- Target environment
- Bundle analysis

#### Features

- ✅ **Real-time preview** - See changes before saving
- ✅ **Form validation** - Prevents invalid configurations
- ✅ **Default values** - Smart defaults for new settings
- ✅ **Save directly** - Updates kubit.config.toml instantly
- ✅ **Reset option** - Revert to defaults

### 4. Plugin Manager

Visual plugin management interface:

- **Browse** available plugins
- **Search** plugin catalog
- **Install/Uninstall** with one click
- **Configure** plugin settings
- **Enable/Disable** plugins without uninstalling
- View plugin **documentation**

### 5. Dependency Viewer

Interactive dependency graph:

- **Tree view** of all dependencies
- **Search and filter** packages
- **Version information**
- **Size analysis**
- **Update available** indicators
- Quick actions (update, remove)

### 6. File Explorer

Browse project files:

- **Tree structure** navigation
- **Quick preview** of files
- **Search files** by name
- **Create/Delete** files and folders
- **Syntax highlighting** for code files

### 7. Terminal Output

Integrated terminal panel:

- **Real-time logs** from running commands
- **Color-coded** output
- **Auto-scroll** option
- **Copy** output to clipboard
- **Clear** terminal
- **Search** in output

### 8. Activity Monitor

Monitor running processes:

- **Dev server** status and URL
- **Build** progress
- **Test** execution status
- **Resource usage** (CPU, memory)
- **Port usage** information

## User Interface

### Modern Design

- **Beautiful gradients** - Eye-catching purple-to-blue design
- **Smooth animations** - Polished user experience
- **Responsive layout** - Works on desktop and tablets
- **Dark mode ready** - Optimized for long sessions
- **Accessible** - WCAG 2.1 compliant

### Navigation

```
┌─────────────────────────────────────────┐
│  🏠 Kubit Forge                     ⚙️  │
├─────────────────────────────────────────┤
│                                         │
│  📊 Dashboard                           │
│  📝 Configuration                       │
│  🧩 Plugins                            │
│  📦 Dependencies                       │
│  📁 Files                              │
│  💻 Terminal                           │
│  📈 Activity                           │
│                                         │
└─────────────────────────────────────────┘
```

## Why Use the GUI?

### Benefits

1. **Beginner-Friendly**
   - No need to remember CLI commands
   - Visual guidance for all features
   - Tooltips and help text

2. **Visual Feedback**
   - See changes in real-time
   - Progress indicators
   - Clear error messages

3. **No Syntax Errors**
   - Form validation prevents mistakes
   - Dropdowns for valid options
   - Type-safe inputs

4. **Quick Access**
   - All features in one place
   - No switching between terminal windows
   - Keyboard shortcuts available

5. **Better for Teams**
   - Non-technical team members can use it
   - Consistent interface for everyone
   - Easy onboarding

### When to Use GUI vs CLI

**Use GUI when:**

- 👨‍💻 You're new to Kubit Forge
- ⚙️ Configuring project settings
- 🔍 Exploring available features
- 📊 Monitoring project health
- 👥 Working with non-technical team members

**Use CLI when:**

- 🚀 Quick one-off commands
- 🤖 Automating tasks (scripts, CI/CD)
- ⌨️ You prefer keyboard-only workflow
- 🔄 Batch operations
- 🐚 SSH/remote sessions

## GUI Architecture

### Zero Dependencies UI

- **Pure HTML/CSS/JS** - No framework dependencies
- **Lightweight** - Fast loading times
- **Self-contained** - Served directly from CLI
- **No build step** - Instant updates

### RESTful API

The GUI communicates with the CLI via REST API:

```
GET  /api/project/info       # Get project information
GET  /api/config             # Get current configuration
POST /api/config             # Update configuration
POST /api/commands/run       # Execute a command
GET  /api/commands/status    # Get command status
GET  /api/plugins            # List plugins
POST /api/plugins/install    # Install plugin
GET  /api/deps               # Get dependencies
```

### Hot Reload

Changes are reflected immediately:

- Configuration updates → auto-refresh
- Command status → real-time polling
- File changes → live updates

### Port Conflict Resolution

If default port (3456) is busy:

- Automatically finds next available port
- Shows new URL in terminal
- Updates browser automatically

### Cross-Platform

Works on:

- ✅ macOS
- ✅ Windows
- ✅ Linux
- ✅ WSL

## Configuration

### GUI Settings

In `kubit.config.toml`:

```toml
[gui]
enabled = true
port = 3456
host = "localhost"
autoOpen = true
theme = "dark"  # or "light"

[gui.features]
terminal = true
fileExplorer = true
dependencyViewer = true
pluginManager = true
```

### Security

```toml
[gui.security]
# Require authentication (future feature)
auth = false
token = "your-secret-token"

# Allow external access
allowExternal = false

# CORS settings
cors = {
  enabled = true,
  origins = ["http://localhost:3000"]
}
```

## Keyboard Shortcuts

| Shortcut | Action               |
| -------- | -------------------- |
| `Ctrl+S` | Save configuration   |
| `Ctrl+R` | Reload project info  |
| `Ctrl+T` | Open terminal        |
| `Ctrl+P` | Open command palette |
| `Ctrl+K` | Clear terminal       |
| `Ctrl+,` | Open settings        |
| `Esc`    | Close modal/panel    |

## Advanced Features

### Remote Access

Access GUI from another machine:

```bash
# Allow external connections
kubit-forge gui --host 0.0.0.0 --port 8080

# Access from another machine
# http://[your-machine-ip]:8080
```

### API Integration

Integrate with custom tools:

```javascript
// Custom dashboard integration
const response = await fetch('http://localhost:3456/api/config');
const config = await response.json();

// Execute command
await fetch('http://localhost:3456/api/commands/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ command: 'build' }),
});
```

### Theming

Customize appearance:

```toml
[gui.theme]
primary = "#7c3aed"
secondary = "#2563eb"
background = "#0f172a"
text = "#f1f5f9"
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
kubit-forge gui --port 8080
```

### Browser Doesn't Open

```bash
# Manually open the URL shown
kubit-forge gui
# Open http://localhost:3456 in your browser
```

### Command Fails in GUI

- Check terminal output panel
- Try running command in CLI
- Check file permissions

### Configuration Not Saving

- Verify file permissions on kubit.config.toml
- Check for syntax errors in existing config
- Try "Reset to Defaults" button

## Best Practices

1. **Start with GUI** for learning
2. **Use CLI** for automation
3. **Keep GUI open** while developing
4. **Monitor terminal** for detailed output
5. **Save configurations** frequently
6. **Review changes** before saving

## Future Features

Coming soon:

- 🔐 Authentication and user management
- 📱 Mobile-responsive design
- 🎨 Custom themes and layouts
- 🔌 Plugin marketplace UI
- 📊 Advanced analytics dashboard
- 🤝 Collaborative features
- 🔄 Real-time team synchronization

## Related Documentation

- [Configuration](./CONFIGURATION.md) - Configuration file format
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Available commands
- [Plugin System](./PLUGIN-SYSTEM.md) - Managing plugins

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).

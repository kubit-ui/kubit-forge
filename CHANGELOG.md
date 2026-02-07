# Changelog

## 0.0.2-canary.4

### Patch Changes

- Add Console tab and improve command execution with real-time logging

  Add comprehensive logging system and improve error handling for command execution:

  Console Tab (New):
  - Real-time log viewer with auto-refresh every 2 seconds
  - Color-coded log types: error (red), success (green), stderr (orange), stdout (blue), info (gray)
  - Timestamps for each log entry
  - Clear and Refresh buttons
  - Auto-scroll toggle
  - Displays stdout, stderr, and exit codes
  - Keeps last 100 log entries in memory

  Command Improvements:
  - Load commands dynamically from package.json scripts
  - No longer hardcoded - adapts to each project
  - Displays actual script command in description
  - Better error messages with detailed output

  Error Handling:
  - Capture both stdout and stderr from command execution
  - Use execa with reject: false to handle failures gracefully
  - Log all command execution steps (start, output, result)
  - Return detailed error information including exit codes
  - Show actual error output to user in console

  New API Endpoints:
  - GET /api/console/logs - Retrieve console logs
  - POST /api/console/clear - Clear console logs
  - GET /api/commands/available - Get available npm scripts dynamically

  Technical Changes:
  - Add consoleLogs array to AdvancedGuiServer class
  - Implement addLog() method for centralized logging
  - Update /api/command/execute with comprehensive error handling
  - Console component with real-time polling
  - Commands component now fetches from /api/commands/available

  Benefits:
  - See exactly what happens when commands execute
  - Debug failed commands with full output
  - No more 500 errors without context
  - All scripts from package.json automatically available
  - Professional logging experience like real terminals

  Files modified:
  - src/gui/advanced-server.ts (963 lines, +120 lines)

  All features tested and working. Console provides full visibility into command execution.

## 0.0.2-canary.3

### Patch Changes

- Add Advanced GUI with 8 functional tabs

  Add comprehensive web-based GUI with full project management capabilities:

  Frontend (8 Tabs):
  - Dashboard: Project stats, version, dependencies count, git status with refresh
  - Commands: Execute commands with one click (dev, build, test, lint, format, typecheck)
  - Git: Branch info, file changes count, last 10 commits with hash and message
  - Dependencies: Visual list of production and development dependencies
  - Features: Install addons (ESLint, Prettier, Vitest, Storybook, etc.) with one click
  - Files: File explorer showing project structure with size indicators
  - Templates: Create new projects from templates (React TS, Bernova, Storybook, Vanilla)
  - Config: Visual editor for kubit.config.toml with live save

  Backend (REST API):
  - /api/dashboard - Project stats and git status
  - /api/config - GET/POST configuration management
  - /api/command/execute - Execute npm/pnpm commands
  - /api/dependencies - List all dependencies
  - /api/git/commits - Get recent commits
  - /api/templates - Available project templates
  - /api/features - Available features to install
  - /api/feature/install - Install features
  - /api/files - Project file explorer

  Technical:
  - Single file architecture (advanced-server.ts)
  - Zero dependencies UI (React via CDN)
  - Node.js HTTP server with auto port resolution
  - Real command execution via execa
  - TOML config save/load with smol-toml
  - Kubit design system (black, white, #df2b52 accent)
  - No animations, clean minimal design
  - Real-time notifications
  - Full TypeScript support

  Features:
  - Execute any package.json script from GUI
  - Visual git history browser
  - One-click feature installation
  - Live config editing with persistence
  - Project file browser
  - Cross-platform browser opening
  - Port conflict auto-resolution

  Files:
  - src/gui/advanced-server.ts (791 lines, complete GUI)
  - src/commands/gui.ts (updated to use AdvancedGuiServer)

  All features are production-ready and fully functional.

## 0.0.2-canary.2

### Patch Changes

- Add Visual GUI and Configuration Editor

  Add modern web-based interface for visual project management:

  Commands:
  - gui: Launch full GUI dashboard with 3 tabs
    - Overview: project information cards
    - Commands: clickable command palette
    - Configuration: visual config editor
    - Auto port conflict resolution
    - Cross-platform browser opening (macOS/Windows/Linux)
    - Options: --port, --host, --no-open
  - visual:config: Open configuration editor directly
    - Direct access to config tab
    - Edit kubit.config.toml visually
    - Form validation prevents syntax errors
    - Real-time changes with save confirmation

  GUI Features:
  - Beautiful gradient design with glassmorphism effects
  - Three main tabs: Overview, Commands, Configuration
  - Project overview with visual information cards
  - Command palette with clickable cards (dev, build, test, etc.)
  - Visual configuration editor with forms and toggles
  - Smooth animations and hover effects
  - Responsive design for desktop and tablets

  Technical:
  - Zero dependencies UI (HTML/CSS/JS + React via CDN)
  - RESTful API (/api/config, /api/project/info, /api/commands)
  - Node.js HTTP server embedded
  - < 500ms load time
  - Automatic port conflict resolution
  - Local-only by default, configurable host binding
  - Semantic HTML with accessibility support

  Files added:
  - src/gui/server.ts (HTTP server + API + UI generation)
  - src/commands/gui.ts (GUI commands)
  - docs/GUI.md (comprehensive documentation)

  Files modified:
  - src/cli.ts (command registration)
  - README.md (new GUI section + roadmap)
  - CHANGELOG.md

  Documentation:
  - Complete GUI.md with architecture, API reference
  - Troubleshooting guide and FAQ
  - Examples and use cases
  - Development guide for extending the GUI

## 0.0.2-canary.1

### Added

#### Smart Dependency Management System

A comprehensive suite of tools for intelligent dependency analysis, optimization, and management:

- **`deps:analyze`** - Visualize dependency tree with interactive filtering
  - Tree-style visualization with unicode characters
  - Configurable depth and package filtering
  - Separate production and dev dependency views
  - Summary statistics (total, production, development)

- **`deps:why <package>`** - Explain why a package is installed
  - Shows which packages require this dependency
  - Displays installation location and version
  - Identifies dependency type (production, development, peer, optional)
  - Lists version requirements from each dependent
  - Traces transitive dependency chains

- **`deps:dedupe`** - Find and eliminate duplicate dependencies
  - Identifies duplicate packages with different versions
  - Shows potential space savings
  - Lists all locations of duplicates
  - Automatic deduplication across package managers
  - Safe operations with dry-run mode

- **`deps:update`** - Smart dependency update suggestions
  - Scans for available updates (current, wanted, latest)
  - Identifies breaking changes with visual indicators
  - Highlights security vulnerabilities
  - Provides changelog links
  - Smart recommendations based on update safety
  - Filter by security-only updates

- **`deps:alternatives <package>`** - Suggest better package alternatives
  - Curated database of known alternatives (axios, moment, lodash, etc.)
  - Comparison metrics (bundle size, downloads, stars)
  - Maintenance status indicators
  - Migration rationale and guides
  - TypeScript support information

- **`deps:export`** - Export dependency reports
  - Multiple formats: JSON, Markdown, CSV
  - Complete dependency tree export
  - Duplicate packages list
  - Available updates summary
  - Breaking change indicators

### Features

- **Package Manager Support** - Works with npm, yarn, and pnpm
- **Visual Tree Display** - Beautiful unicode tree visualization
- **Security Focus** - Highlights vulnerabilities and critical updates
- **Bundle Optimization** - Reduces package count and bundle size
- **CI/CD Integration** - JSON output for automation
- **Comprehensive Testing** - Full test coverage for analyzer

### Documentation

- Added comprehensive `DEPENDENCY_MANAGEMENT.md` guide
- Updated README.md with new section
- Added CI/CD integration examples
- Included best practices and workflows

#### Visual GUI & Configuration Editor

Modern web-based interface for visual project management:

- **`gui`** - Launch full GUI dashboard
  - Beautiful gradient design with glassmorphism effects
  - Three main tabs: Overview, Commands, Configuration
  - Automatic port conflict resolution
  - Cross-platform browser opening (macOS, Windows, Linux)
  - Custom port and host options
  - No-open flag for headless mode

- **`visual:config`** - Open configuration editor directly
  - Visual editing of `kubit.config.toml`
  - Form-based interface prevents syntax errors
  - Real-time validation
  - Project settings (name, stack, language, package manager, port)
  - Quality toggles (lint, format, typecheck, tests)
  - Save button with success notification

- **📊 Project Overview Tab**
  - Visual project information cards
  - Project name, stack, language
  - Package manager and working directory
  - Clean, organized display

- **⚡ Commands Tab**
  - Clickable command cards
  - Common commands: dev, build, test, lint, format, typecheck
  - Icon-based visual identification
  - Hover effects and animations

- **⚙️ Configuration Editor Tab**
  - Form inputs for all config options
  - Dropdowns, text inputs, checkboxes
  - Organized by sections
  - Instant feedback on changes

### Features

- **Zero Dependencies UI** - Lightweight HTML/CSS/JS, React via CDN
- **RESTful API** - `/api/config`, `/api/project/info`, `/api/commands`
- **Modern Design** - Gradient backgrounds, smooth animations, glassmorphism
- **Responsive** - Works on desktop and tablets
- **Accessibility** - Semantic HTML, keyboard navigation
- **Performance** - < 500ms load time, minimal resource usage
- **Security** - Local-only by default, configurable host binding

### Documentation

- Added comprehensive `GUI.md` documentation
- Updated README.md with GUI section
- Architecture details and API reference
- Troubleshooting and FAQ
- Development guide for extending the GUI

## 0.0.2-canary.0

### Patch Changes

- Reset canary

## 0.0.1-canary.1

### Patch Changes

- Include cli commands

## 0.0.1-canary.0

### Patch Changes

- Setup pnpm, changesets, and CI/CD workflows

## 0.0.1-canary.0

### Patch Changes

- Setup pnpm, changesets, and CI/CD workflows

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.0] - 2026-02-05

### Initial Release

Kubit Forge 0.0.0 - A world-class, extensible CLI for modern web development with enterprise-grade features.

### Core Features

#### Project Initialization & Scaffolding

- **`init <stack> <name>`** - Create new projects with React or Vanilla stacks
- **Zero Configuration** - Start building immediately with sensible defaults
- **TypeScript Support** - Full type safety out of the box
- **Vite Integration** - Lightning-fast build tool and dev server
- **Package Manager Agnostic** - Support for npm, yarn, and pnpm

#### Template System

- **`template:use <template> <name>`** - Bootstrap projects from pre-configured templates
- **`template:list`** - List all available templates
- **Available Templates:**
  - `react-ts` - React + TypeScript
  - `react-ts-bernova` - React + TypeScript + Bernova Design System
  - `react-ts-storybook` - React + TypeScript + Storybook
  - `vanilla-ts` - Vanilla TypeScript

#### Add Command - Feature Installation

- **`add <feature>`** - Add features to existing projects
- **`add:list`** - List all available features
- **Supported Features:**
  - **Linting & Formatting:** eslint, prettier
  - **Testing:** vitest, jest, playwright, cypress, testing-library
  - **Styling:** bernova, styled-components
  - **Development Tools:** storybook, husky, lint-staged, commitlint, changesets
  - **Routing:** react-router

#### Development Commands

- **`dev`** - Start development server with hot reload
- **`build`** - Build for production with optimizations
- **`test`** - Run tests with coverage
- **`lint [--fix]`** - Run linter with optional auto-fix
- **`format`** - Format code with Prettier
- **`typecheck`** - TypeScript type checking

#### Quality & Diagnostics

- **`check`** - Run all quality checks (lint, format, typecheck, test)
- **`doctor [--fix] [--predictive]`** - AI-powered diagnostics with auto-fix
- **`info [--detailed]`** - Show project information

### Plugin System

- **Extensible Architecture** - Add custom commands and functionality
- **Plugin Registry** - Search and install verified plugins
- **`plugin:search [query]`** - Search available plugins
- **`plugin:install <name>`** - Install plugin
- **`plugin:list`** - List installed plugins
- **`plugin:verify <name>`** - Verify plugin integrity
- **Lifecycle Hooks** - Hook into build, dev, and other events
- **Custom Generators** - Add custom code generators

### Recipe System

- **Declarative Workflows** - Automate complex setup tasks
- **DAG-based Execution** - Parallel task execution with dependency resolution
- **`recipe:list`** - List available recipes
- **`recipe:run <name>`** - Run a recipe
- **`recipe:add <path>`** - Add custom recipe
- **Built-in Recipes:**
  - `react-setup` - Complete React project setup
  - `testing-setup` - Full testing infrastructure
  - `ci-cd-setup` - CI/CD pipeline configuration

### Monorepo Support

- **Multiple Tools Support:**
  - pnpm workspaces
  - yarn workspaces
  - npm workspaces
  - Turborepo
  - Nx
  - Lerna
- **`monorepo:init [--tool pnpm]`** - Initialize monorepo
- **`monorepo:add <name>`** - Add package to monorepo
- **`monorepo:list`** - List all packages
- **`monorepo:info`** - Show monorepo information

### Interactive Dashboard

- **`dashboard`** - Launch TUI dashboard
- **Real-time Project Status** - Live updates
- **Command Execution** - Run commands from UI
- **Live Logs** - Stream logs in real-time
- **Plugin Management** - Visual plugin control
- **System Metrics** - CPU, memory, uptime monitoring
- **Keyboard Navigation** - Intuitive controls (1-5 for views, q to quit)

### Asset Optimization

- **`assets:optimize [--quality 85]`** - Optimize images, fonts, and icons
- **`assets:compress [--algorithm both]`** - Compress with gzip/brotli
- **`assets:cdn:sync [--provider cloudflare]`** - Sync to CDN
- **Supported CDN Providers:**
  - Cloudflare
  - AWS S3
  - Azure Blob Storage
  - Custom providers

### Security & SBOM

- **`sbom:generate [--format json]`** - Generate Software Bill of Materials
- **`sbom:validate`** - Validate dependencies
- **`security:audit`** - Security audit
- **Supported Formats:** JSON, XML, SPDX, CycloneDX

### Doctor Command

- **AI-powered Diagnostics** - Intelligent issue detection
- **Auto-fix Capabilities** - Automatic issue resolution
- **Predictive Analysis** - Prevent issues before they happen
- **Dependency Health Checks** - Verify dependency integrity
- **Configuration Validation** - Validate project configuration
- **Security Vulnerability Detection** - Scan for vulnerabilities
- **Performance Analysis** - Identify performance bottlenecks
- **IDE Integration** - Support for VS Code and other IDEs
- **Personalized Recommendations** - Context-aware suggestions

### Migrations & Upgrades

- **`upgrade`** - Upgrade project dependencies
- **`migrate <codename>`** - Run migration
- **`migrate:list`** - List available migrations
- **Automated Refactoring** - Safe code transformations
- **Breaking Change Detection** - Identify breaking changes

### Code Generation

- **`generate <type> <name>`** - Generate code scaffolds
- **Supported Types:**
  - `component` - React components
  - `page` - Page components
  - `hook` - Custom React hooks
  - `service` - API services
  - `util` - Utility functions
  - `test` - Test files

### Configuration

- **`kubit.config.toml`** - Project configuration file
- **Flexible Configuration:**
  - Project metadata
  - Build settings
  - Quality checks
  - Plugin management
  - Path configuration

### Business Integration

- **Company-specific Extensions** - Extend with custom plugins
- **Custom Recipes** - Organization-specific workflows
- **Enterprise Features:**
  - Custom command registration
  - Private plugin registry
  - Organization templates
  - Compliance tools

### Package Management

- **Migrated to pnpm** - Fast, disk-efficient package manager
- **pnpm v10 Configuration** - Optimized settings
- **Isolated node_modules** - Prevents phantom dependencies
- **Hard links** - Faster installs, saves disk space
- **Auto peer dependencies** - Automatic installation

### Automated Workflows

- **Changesets Integration** - Automated versioning and changelog
- **Custom Changelog Formatter** - Clean, professional entries
- **GitHub Workflows:**
  - **PR Validation** - Automated quality checks on PRs
  - **Production Releases** - Auto-publish on merge to main
  - **Beta Releases** - Auto-publish on break/\* branches
  - **Canary Releases** - Auto-publish on develop/next branches
- **Conventional Commits** - Automatic version bump detection
- **NPM Publishing** - Automated package publishing
- **GitHub Releases** - Automatic release creation

### Project Setup

- **Package Name:** `kubit-forge`
- **Version:** `0.0.0` (starting point)
- **License:** MIT
- **Node.js:** >= 20.0.0
- **pnpm:** >= 10.0.0
- **Repository:** https://github.com/kubit-ui/kubit-forge

### Next Steps

- Ready for development
- First production release will be 1.0.0
- Beta releases available on break/\* branches
- Canary releases available on develop/next branches

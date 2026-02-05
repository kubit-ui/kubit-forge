# Changelog

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

# Contributing to Kubit Forge

Thank you for your interest in contributing to Kubit Forge! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Yarn >= 4.9.1 (or npm)
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/kubit-forge.git
cd kubit-forge
```

---

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📁 Project Structure

```
kubit-forge/
├── src/
│   ├── cli.ts           # CLI entry point
│   ├── index.ts         # Library entry point
│   ├── commands/        # Command implementations
│   ├── core/            # Core functionality
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── dashboard/       # Interactive dashboard
│   └── templates/       # Template definitions
├── templates/           # Physical templates
├── dist/                # Build output
├── docs/                # Documentation
├── .github/             # GitHub workflows
├── package.json
├── tsconfig.json
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── CHANGELOG.md
```

---

## 🔧 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test
npm test -- path/to/test.spec.ts

# Check types
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in command"
git commit -m "docs: update README"
git commit -m "test: add tests for feature"
git commit -m "refactor: improve code structure"
git commit -m "chore: update dependencies"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

---

## 🧪 Testing

### Writing Tests

Tests are located in `__tests__` directories or as `.test.ts` files.

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- path/to/file.test.ts
```

---

## 📤 Submitting Changes

### 1. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template
- Submit the PR

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what and why
- **Tests**: Include tests for new features
- **Documentation**: Update docs if needed
- **Changelog**: Note breaking changes

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing performed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all code
- Define types explicitly
- Avoid `any` type
- Use interfaces for objects
- Use enums for constants

```typescript
// Good
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

// Avoid
function greet(user: any) {
  return `Hello, ${user.name}!`;
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use trailing commas
- Max line length: 100 characters

```typescript
// Good
const user = {
  name: 'John',
  age: 30,
};

// Avoid
const user = {
  name: 'John',
  age: 30,
};
```

### Naming Conventions

- **Variables/Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case.ts

```typescript
// Variables and functions
const userName = 'John';
function getUserName() {}

// Classes and interfaces
class UserManager {}
interface UserConfig {}

// Constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Files
user - manager.ts;
api - client.ts;
```

### Comments

- Use JSDoc for functions and classes
- Write clear, concise comments
- Explain "why", not "what"

```typescript
/**
 * Fetches user data from the API
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to user data
 * @throws Error if user not found
 */
async function fetchUser(userId: string): Promise<User> {
  // Implementation
}
```

---

## 📚 Documentation

### Update Documentation

When making changes, update relevant documentation:

- **README.md**: Main documentation
- **docs/**: Detailed guides
- **CHANGELOG.md**: Version history
- **Code comments**: Inline documentation

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep it up to date

---

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Try the latest version
- Reproduce the bug

### Bug Report Template

```markdown
## Description

Clear description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., macOS 14.0]
- Node: [e.g., 20.0.0]
- Kubit Forge: [e.g., 1.0.0]

## Additional Context

Any other relevant information
```

---

## 💡 Feature Requests

### Before Requesting

- Check existing issues
- Consider if it fits the project scope
- Think about implementation

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should it work?

## Alternatives Considered

Other approaches you've thought about

## Additional Context

Any other relevant information
```

---

## 🎯 Areas to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are great for new contributors.

### Areas of Focus

- **Commands**: Add new commands or improve existing ones
- **Plugins**: Create new plugins or improve plugin system
- **Recipes**: Add new recipes or improve recipe engine
- **Dashboard**: Enhance the interactive dashboard
- **Documentation**: Improve docs and examples
- **Tests**: Increase test coverage
- **Performance**: Optimize performance
- **Bug Fixes**: Fix reported bugs

---

## 🤝 Community

### Getting Help

- **GitHub Discussions**: Ask questions
- **Issue Tracker**: Report bugs
- **Pull Requests**: Submit changes

### Communication

- Be respectful and constructive
- Help others when you can
- Share your knowledge
- Celebrate successes

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Thank you for contributing to Kubit Forge! Your efforts help make this project better for everyone.

**Happy coding! 🚀**

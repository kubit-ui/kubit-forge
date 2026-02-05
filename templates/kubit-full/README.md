# {{projectName}}

Full Kubit Ecosystem Template - A complete showcase of the Kubit design system including React Components, Charts, and Bernova CSS-in-JS.

## 🚀 Features

- **Bernova** - CSS-in-JS with JavaScript syntax for maintainable styling
- **Kubit React Components** - Accessible, customizable UI components
- **Kubit React Charts** - Beautiful data visualization components
- **ESLint Config Kubit** - Opinionated linting rules for quality code
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast development experience
- **Vitest** - Modern testing framework

## 📦 What's Included

### Design System

- **Foundations**: Colors, spacing, typography, shadows, and more
- **Global Styles**: Reset CSS and utility classes
- **Media Queries**: Responsive breakpoints (mobile, tablet, desktop, wide)
- **Components**: Buttons, Cards, Inputs with variants and states

### Components Showcase

- Multiple button variants (Primary, Secondary, Outline, Ghost)
- Card components with headers, bodies, and footers
- Form inputs with validation states
- Design tokens visualization

### Charts Showcase

- Bar Charts
- Line Charts
- Pie Charts
- Responsive and accessible
- Customizable themes

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install

# Generate Bernova styles
pnpm bernova

# Start development server
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev                    # Start dev server
pnpm bernova                # Generate all Bernova styles
pnpm bernova:foundation     # Generate only foundations
pnpm bernova:component      # Generate only components

# Build
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint errors
pnpm format                 # Format code with Prettier
pnpm format:check           # Check code formatting
pnpm typecheck              # Run TypeScript checks
pnpm validate               # Run all checks

# Testing
pnpm test                   # Run tests
pnpm test:ui                # Run tests with UI
pnpm test:coverage          # Run tests with coverage
```

## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── components/         # React components
│   │   ├── ComponentsShowcase.tsx
│   │   └── ComponentsShowcase.css
│   ├── charts/            # Chart components
│   │   ├── ChartsShowcase.tsx
│   │   └── ChartsShowcase.css
│   ├── styles/            # Styling system
│   │   ├── theme/         # Bernova theme definitions
│   │   │   ├── foundations.ts
│   │   │   ├── globalStyles.ts
│   │   │   ├── mediaQueries.ts
│   │   │   ├── components/
│   │   │   └── theme.ts
│   │   ├── default/       # Generated CSS (gitignored)
│   │   └── index.css      # Main styles entry
│   ├── test/              # Test setup
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── public/                # Static assets
├── bernova.config.json    # Bernova configuration
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Styling with Bernova

Bernova allows you to write CSS with JavaScript syntax. Styles are defined in `src/styles/theme/` and compiled to CSS.

### Example Component Style

```typescript
// src/styles/theme/components/button.ts
export const BUTTON = {
  padding: 'var(--spacing-sm) var(--spacing-md)',
  border_radius: 'var(--borderRadius-md)',

  PRIMARY: {
    background_color: 'var(--colors-primary)',
    color: 'var(--colors-white)',
  },
};
```

### Using Generated Styles

After running `pnpm bernova`, use the generated CSS classes:

```tsx
<button className="button button--primary">Click me</button>
```

## 🧩 Kubit Components

This template integrates `@kubit-ui-web/react-components` for production-ready UI components.

```tsx
import { Button } from '@kubit-ui-web/react-components';

<Button variant="primary" size="medium">
  Click me
</Button>;
```

## 📊 Kubit Charts

Beautiful, accessible charts from `@kubit-ui-web/react-charts`.

```tsx
import { BarChart } from '@kubit-ui-web/react-charts';

<BarChart data={data} width={600} height={400} />;
```

## 🔧 Configuration

### Bernova Configuration

Edit `bernova.config.json` to customize:

- Theme name and paths
- Foundations (colors, spacing, etc.)
- Global styles
- Media queries
- Font imports
- CSS reset

### TypeScript Paths

Path aliases are configured in `tsconfig.json`:

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@styles/*` → `./src/styles/*`
- `@charts/*` → `./src/charts/*`

## 🧪 Testing

Tests are written with Vitest and React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Kubit Ecosystem/i)).toBeInTheDocument();
  });
});
```

## 📚 Learn More

- [Bernova Documentation](https://github.com/kubit-ui/bernova)
- [Kubit React Components](https://github.com/kubit-ui/kubit-react-components)
- [Kubit React Charts](https://github.com/kubit-ui/kubit-react-charts)
- [ESLint Config Kubit](https://github.com/kubit-ui/eslint-config-kubit)

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines in each package's repository.

## 📄 License

MIT © Kubit Team

---

Built with ❤️ using the Kubit ecosystem

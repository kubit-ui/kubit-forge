# {{projectName}}

React application built with **Bernova** - CSS-in-JS with JavaScript syntax.

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Generate CSS from Bernova styles
yarn bernova

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## 🎨 Bernova - CSS-in-JS

This project uses [Bernova](https://github.com/kubit-ui/bernova), a powerful CSS-in-JS library that allows you to write CSS with JavaScript syntax.

### Key Features

- ✅ Write CSS with JavaScript objects
- ✅ Type-safe with TypeScript
- ✅ CSS Variables (Custom Properties)
- ✅ Media Queries
- ✅ Pseudo-classes and Pseudo-elements
- ✅ Nested styles
- ✅ Variant-based styling

### Configuration

Bernova is configured via `bernova.config.json`. The configuration includes:

- **Foundations**: CSS variables for colors, spacing, typography, etc.
- **Global Styles**: Global CSS classes and element styles
- **Media Queries**: Responsive breakpoints
- **Theme**: Component-specific styles

### Customizing Styles

#### 1. Edit Foundations

Edit `src/styles/foundations.ts` to customize design tokens:

```typescript
export const FOUNDATIONS = {
  colors: {
    primary: '#E60028',
    secondary: '#00A650',
    // ... more colors
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};
```

#### 2. Add Global Styles

Edit `src/styles/globalStyles.ts` to add utility classes:

```typescript
export const GLOBAL_STYLES = [
  {
    targets: '.my-class',
    styles: {
      padding: 'var(--spacing-md)',
      background_color: 'var(--colors-primary)',
    },
  },
];
```

#### 3. Define Component Styles

Edit `src/styles/theme.ts` to create component styles:

```typescript
export const THEME_STYLES = {
  Button: {
    base: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      border_radius: 'var(--borderRadius-md)',
    },
    variants: {
      primary: {
        background_color: 'var(--colors-primary)',
      },
    },
  },
};
```

#### 4. Generate CSS

After editing styles, run:

```bash
yarn bernova
```

This will generate CSS files in `src/styles/output/`.

## 📦 Scripts

- `yarn dev` - Start development server
- `yarn build` - Generate CSS and build for production
- `yarn preview` - Preview production build
- `yarn bernova` - Generate CSS from Bernova styles
- `yarn bernova:foundation` - Generate only foundations CSS
- `yarn bernova:component` - Generate only component CSS
- `yarn lint` - Lint code with ESLint
- `yarn format` - Format code with Prettier
- `yarn test` - Run tests with Vitest
- `yarn test:ui` - Run tests with UI
- `yarn test:coverage` - Generate coverage report

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Bernova** - CSS-in-JS library
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities

## 📚 Documentation

- [Bernova GitHub](https://github.com/kubit-ui/bernova)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT

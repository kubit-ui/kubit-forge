# {{projectName}}

React application built with Kubit UI Components and Design System.

## Features

- ⚛️ React 18
- 🎨 Kubit UI Components
- 🎭 Kubit Design System (Bernova)
- 📦 Vite
- 🔷 TypeScript
- ✅ Vitest + Testing Library
- 🎯 ESLint + Prettier

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm run build
```

### Test

```bash
pnpm run test
```

### Lint

```bash
pnpm run lint
pnpm run format
```

## Project Structure

```
src/
├── components/     # React components
├── styles/         # Global styles
├── test/          # Test utilities
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

## Using Kubit UI Components

### Setup Provider

The app is already configured with the Kubit Design System Provider:

```tsx
import { Provider, KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { StylesProvider, Button } from '@kubit-ui-web/react-components';

function App() {
  const { ButtonSizeType, ButtonVariantType } = KUBIT_VARIANTS;

  return (
    <StylesProvider bernovaProvider={Provider}>
      <Button variant={ButtonVariantType.PRIMARY} size={ButtonSizeType.LARGE}>
        Click me
      </Button>
    </StylesProvider>
  );
}
```

### Available Components

Import components from `@kubit-ui-web/react-components`:

- Button
- Input
- Text
- Card
- Modal
- And many more...

### Using Variants

Import variants from `KUBIT_VARIANTS`:

```tsx
import { KUBIT_VARIANTS } from '@kubit-ui-web/design-system';

const { ButtonVariantType, ButtonSizeType, TextVariantType, InputVariantType } = KUBIT_VARIANTS;
```

## Learn More

- [Kubit UI Components](https://www.kubit-ui.com/)
- [Kubit Design System](https://github.com/kubit-ui/kubit-react-components)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

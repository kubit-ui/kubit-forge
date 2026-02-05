# My App

Vanilla TypeScript application created with kubit-forge.

## Getting Started

### Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
kubit-forge dev
```

### Build

```bash
kubit-forge build
```

### Preview

```bash
kubit-forge preview
```

### Quality Checks

```bash
# Run all checks
kubit-forge check

# Individual checks
kubit-forge lint
kubit-forge format
kubit-forge typecheck
kubit-forge test
```

### Generate Components

```bash
kubit-forge generate component Button
```

## Project Structure

```
src/
├── app.ts         # Main application
├── main.ts        # Entry point
├── styles/        # Global styles
└── lib/           # Utilities and helpers
```

## Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
kubit-forge env init
```

## Learn More

- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [kubit-forge Documentation](https://github.com/kubit-ui/kubit-forge)

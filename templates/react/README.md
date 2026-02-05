# My App

React application created with kubit-forge.

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
kubit-forge generate page Settings
kubit-forge generate hook useAuth
```

## Project Structure

```
src/
├── app/           # Application bootstrap
├── components/    # Reusable components
├── pages/         # Page components
├── lib/           # Utilities and helpers
├── services/      # API clients
├── styles/        # Global styles
└── test/          # Test setup
```

## Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
kubit-forge env init
```

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [kubit-forge Documentation](https://github.com/kubit-ui/kubit-forge)

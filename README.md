# VeloceMart

Monorepo for the VeloceMart e-commerce platform.

## Structure

```
├── frontend/          # Next.js 16 (App Router, TypeScript, TailwindCSS v4)
│   └── src/
│       ├── app/              # App Router pages & layouts
│       ├── features/         # Feature-based modules (products, cart, auth)
│       ├── components/       # Shared UI components
│       └── lib/              # Shared utilities & helpers
├── backend/           # NestJS 11 (TypeScript)
│   └── src/
│       ├── products/         # Products feature
│       ├── cart/             # Cart feature
│       ├── auth/             # Auth feature
│       └── common/           # Shared guards, interceptors, pipes, filters
└── package.json       # Root workspace config
```

## Prerequisites

- Node.js >= 20
- npm >= 10

## Setup

```bash
# Install all dependencies (root + both apps)
npm install

# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Development

```bash
# Run both apps in parallel
npm run dev

# Or run individually:
npm run dev -w frontend      # http://localhost:3000
npm run start:dev -w backend # http://localhost:3001
```

## Lint & Format

```bash
npm run lint
npm run format
```

## Build

```bash
npm run build
```

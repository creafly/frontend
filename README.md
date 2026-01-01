# Creafly Frontend

[![CI/CD](https://github.com/creafly/frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/creafly/frontend/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/creafly/frontend?display_name=tag&sort=semver)](https://github.com/creafly/frontend/releases)
[![License](https://img.shields.io/github/license/creafly/frontend)](LICENSE)
[![Issues](https://img.shields.io/github/issues/creafly/frontend)](https://github.com/creafly/frontend/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/creafly/frontend)](https://github.com/creafly/frontend/pulls)

Next.js frontend application for Creafly AI email generation platform.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run linting
pnpm lint

# Type check
pnpm exec tsc --noEmit

# Build for production
pnpm build
```

## Pre-commit Hooks

To enable pre-commit hooks for linting:

```bash
make setup-hooks
```

## Docker

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

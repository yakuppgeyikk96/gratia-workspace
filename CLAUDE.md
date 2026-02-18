# Gratia E-Commerce Workspace

Monorepo for the Gratia e-commerce platform using pnpm workspaces + Turborepo.

## Project Structure

- `apps/gratia-api` — Express 5 REST API (TypeScript 5.9, Drizzle ORM, PostgreSQL, Redis, Stripe)
- `apps/gratia-ui` — Next.js 15 storefront (App Router, Turbopack, React 19, SCSS Modules, Zustand, TanStack Query)
- `apps/gratia-mobile` — Expo React Native mobile app
- `packages/ui` — Shared Radix UI component library with Storybook (`@gratia/ui`)
- `packages/eslint-config` — Shared ESLint config (`@gratia/eslint-config`)
- `packages/typescript-config` — Shared TypeScript config (`@gratia/typescript-config`)

## Commands

```bash
pnpm dev              # Start all apps (Turborepo)
pnpm build            # Build all packages and apps
pnpm lint             # ESLint on all packages
pnpm format           # Prettier format TS/TSX/MD files
pnpm check-types      # TypeScript type checking across all packages
pnpm docker:up        # Start Docker Compose (Redis + API + UI)
pnpm docker:down      # Stop Docker Compose
```

To run a specific app: `pnpm dev --filter=gratia-api` or `pnpm dev --filter=gratia-ui`

## Package Manager

- **pnpm 10.20.0+** is required. Never use npm or yarn.
- Use `workspace:*` for internal package references.
- Install dependencies: `pnpm install` (root) or `pnpm add <pkg> --filter=<app>`

## TypeScript

- TypeScript 5.9.2 with strict mode enabled globally.
- `exactOptionalPropertyTypes: true` and `noUncheckedIndexedAccess: true` in the API.
- Always use explicit types for function parameters and return values in service/repository layers.

## Environment Variables

- **Never commit `.env` files.** See `.env.example` for required variables.
- API local dev: `DATABASE_URL_LOCAL`, `REDIS_HOST_LOCAL`, `REDIS_PORT_LOCAL`
- API production: `DATABASE_URL_PRODUCTION`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`
- UI: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Deployment

- API: Google Cloud Build → Cloud Run. See `cloudbuild-gratia-api.yaml`.
- UI: Docker container with Next.js standalone output. See `apps/gratia-ui/Dockerfile`.
- Database: Supabase PostgreSQL (transaction pooler on port 6543).
- Redis: Docker locally, managed Redis in production.

## Conventions

- All code, comments, and commit messages in English.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `perf:`
- Prefer named exports for services, types, and utilities. Default exports only for route modules and React page/component files.
- Never use `any` type. Use `unknown` and narrow with type guards.
- Run `pnpm check-types` after making a series of code changes to catch issues early.

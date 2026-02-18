# Gratia UI

Next.js 15 storefront using App Router, Turbopack, React 19, SCSS Modules, Zustand, TanStack Query, and Vitest.

## Commands

```bash
pnpm dev             # Start with Turbopack
pnpm build           # Production build
pnpm test            # Run Vitest
pnpm test:watch      # Vitest watch mode
pnpm test:ui         # Vitest with browser UI
pnpm test:coverage   # V8 coverage report
```

## App Router Structure

```
src/app/
  layout.tsx                  — Root layout (providers, CartInitializer)
  globals.scss                — Global styles
  (main)/layout.tsx           — Main layout (header, footer)
    page.tsx                  — Home page
    (auth)/                   — Auth pages (login, register, verify-email)
    (content)/                — Content pages with sidebar layout
      products/               — Product listing and detail
      cart/                   — Cart page
      profile/                — User profile
      become-a-vendor/        — Vendor registration
    orders/                   — Order history
  checkout/                   — Checkout flow (separate layout)
```

## Server Actions

All API calls go through server actions in `src/actions/` with `"use server"` directive. These use `apiClient` from `src/lib/apiClient.ts` (fetch-based HTTP client with timeout and error handling). API base URL configured in `src/constants/api.ts`.

## Component Pattern

```
src/components/<domain>/<ComponentName>/
  index.tsx                   — Component code (default export)
  ComponentName.module.scss   — Scoped SCSS styles
  ComponentName.test.tsx      — Tests (optional)
```

- Use `"use client"` directive **only** when needed (hooks, event handlers, browser APIs).
- Import shared components from `@gratia/ui/components/<Name>`.
- Use `classnames` package for conditional CSS class composition.
- SCSS Modules only — never inline styles or CSS-in-JS.

## State Management

**Zustand** for client state — stores in `src/store/`:
- `cartStore.ts` — Cart items, counts, operations
- `productFilterStore.ts` — Selected filters, drawer state, filter context

**TanStack Query** for server data — provider at `src/components/providers/TanstackQueryClientProvider`.

## Forms

React Hook Form + Zod validation via `@hookform/resolvers/zod`:
- Schemas in `src/schemas/` (loginSchema, registerSchema, checkoutSchema, vendorSchema)
- Pattern: `useForm<FormData>({ resolver: zodResolver(schema), mode: "onBlur" })`

## Styling

- SCSS Modules: `import styles from "./Component.module.scss";`
- Global styles: `src/app/globals.scss`
- Breakpoints: xs=480, sm=640, md=768, lg=1024, xl=1280, 2xl=1536

## Testing

- **Stack**: Vitest + jsdom + React Testing Library
- **Setup**: `src/test/setup.ts` (mocks `next/navigation`, `next/headers`)
- **Path alias**: `@/` resolves to `src/` in vitest config
- **Location**: Co-located `.test.tsx` files or `__tests__/` directories

## Key Directories

- `src/actions/` — Server actions for API calls
- `src/components/` — UI components (auth, common, features, hero, layout, providers)
- `src/constants/` — App constants (api, breakpoints, colors, cookies, regexes)
- `src/hooks/` — Custom hooks (useCart, useProductFilters, useEmblaAutoplay)
- `src/lib/` — Utilities (apiClient, errorHandler, filterUtils)
- `src/schemas/` — Zod validation schemas for forms
- `src/store/` — Zustand stores
- `src/types/` — TypeScript types (PascalCase filenames, re-exported from index.ts)

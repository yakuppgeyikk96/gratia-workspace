# Gratia API

Express 5 REST API with TypeScript 5.9, Drizzle ORM (PostgreSQL), Redis caching, Stripe payments, and Zod validation.

## Commands

```bash
pnpm dev                       # Start with nodemon + ts-node
pnpm build                     # Compile TypeScript to dist/
pnpm check-types               # Type check without emitting
pnpm db:generate               # Generate Drizzle migration files
pnpm db:migrate                # Run Drizzle migrations
pnpm db:push                   # Push schema changes (dev only)
pnpm db:studio                 # Open Drizzle Studio GUI
pnpm load-test:browse          # k6: browse products
pnpm load-test:stock-race      # k6: concurrent stock reservation
pnpm load-test:idempotency     # k6: checkout idempotency
pnpm load-test:checkout-flow   # k6: full checkout flow
```

## Entry Point

`src/app.ts` initializes Express with helmet, cors, compression, JSON parsing. **Stripe webhook routes are mounted BEFORE `express.json()`** because webhooks need raw body. Routes configured via `src/config/routes.config.ts`. Graceful shutdown handles SIGTERM/SIGINT for Cloud Run (8s timeout).

## Module Pattern

Each feature lives in `src/modules/<name>/`:

```
<name>.routes.ts         — Express Router with route definitions
<name>.controller.ts     — Request handlers using asyncHandler wrapper
<name>.service.ts        — Business logic with caching
<name>.repository.ts     — Database queries (Drizzle ORM only)
<name>.cache.ts          — Redis cache instances using createCache<T>()
<name>.validations.ts    — Zod schemas for request validation
<name>.constants.ts      — Module-specific constants
types/index.ts           — TypeScript interfaces
utils/                   — Helper functions
index.ts                 — Barrel exports
```

Not every module needs all files. Simpler modules skip `cache.ts`. The `product` module is the most comprehensive reference example.

## Request Flow

Route → Zod validation middleware → Controller → Service → Cache check → Repository → Drizzle query → Response

## Error Handling

```typescript
import { AppError, ErrorCode } from "../../shared/errors/base.errors";

// Throw operational errors with appropriate code and status
throw new AppError("Product not found", ErrorCode.NOT_FOUND, 404);
throw new AppError("Email already exists", ErrorCode.DUPLICATE_ENTRY, 409);
throw new AppError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS, 401);
```

ErrorCode values: `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `DUPLICATE_ENTRY`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`

Controllers always use `asyncHandler()` wrapper from `src/shared/middlewares/`.

## Validation

```typescript
import { z } from "zod";
import { validateBody, validateQuery, validateParams } from "../../shared/middlewares";

const createSchema = z.object({ name: z.string().min(1) });
type CreateDto = z.infer<typeof createSchema>;

router.post("/", validateBody(createSchema), createController);
router.get("/:slug", validateParams(slugSchema), getBySlugController);
```

## Caching

```typescript
import { createCache } from "../../shared/services";

// Create typed cache instance with prefix and TTL (seconds)
export const myCache = createCache<MyType>("my-prefix", 300);

// In service: check cache → fetch → write cache (non-blocking)
const cached = await myCache.get(cacheKey);
if (cached) return cached;

const result = await findFromDb();
myCache.set(cacheKey, result).catch(err => console.error("Cache write failed:", err));

// Invalidation uses SCAN (not KEYS)
await myCache.invalidate();              // all keys with prefix
await myCache.invalidate("pattern*");    // specific pattern
```

Cache writes are always non-blocking (fire-and-forget with `.catch()`). Redis failures never break requests.

## Database

- **ORM**: Drizzle ORM with `postgres` driver (not `pg`).
- **Connection**: `src/config/postgres.config.ts` — pool: max=10, idle_timeout=20, connect_timeout=10.
- **Schemas**: `src/db/schema/<name>.schema.ts`, re-exported from `src/db/schema/index.ts`.
- **Config**: `drizzle.config.ts` at project root.
- JSONB columns use `.$type<T>()` for type inference.

## Authentication

- JWT via `authMiddleware` (required) and `optionalAuthMiddleware` (guest or authenticated).
- Token from `Authorization: Bearer <token>` header.
- `AuthRequest` extends Express `Request` with `user?: { userId, email, firstName, lastName }`.

## Response Format

```typescript
import { returnSuccess } from "../../shared/utils/response.utils";
import { StatusCode } from "../../shared/types";

// Success: { success: true, message, data, timestamp }
returnSuccess(res, data, "Retrieved successfully", StatusCode.SUCCESS);

// Errors are handled by the error middleware automatically
```

## Existing Modules

auth, brand, cart, category, category-attribute-template, checkout, collection, location, navigation, order, product, seed, shipping, user, vendor, verification, webhooks

## Key Shared Paths

- `src/shared/errors/base.errors.ts` — AppError class, ErrorCode enum
- `src/shared/middlewares/` — asyncHandler, auth, validation, requestLogger
- `src/shared/services/` — createCache, Redis CRUD, email, Stripe
- `src/shared/utils/` — response utils, JWT, encryption, token generation
- `src/shared/types/` — IApiResponse, AuthRequest, StatusCode enum
- `src/config/` — postgres, redis, routes, environment validation

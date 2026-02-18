---
name: create-api-module
description: Scaffold a new API module in the Gratia API following project conventions. Creates routes, controller, service, repository, cache, types, and validation files.
disable-model-invocation: true
argument-hint: <module-name>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Create API Module

Create a new module named `$ARGUMENTS` in `apps/gratia-api/src/modules/$ARGUMENTS/`.

## Steps

1. Read an existing module for reference patterns. The `product` module is the most comprehensive:
   - `apps/gratia-api/src/modules/product/product.routes.ts`
   - `apps/gratia-api/src/modules/product/product.controller.ts`
   - `apps/gratia-api/src/modules/product/product.service.ts`
   - `apps/gratia-api/src/modules/product/product.repository.ts`
   - `apps/gratia-api/src/modules/product/product.cache.ts`

2. Create the module directory and all files following the templates below. Replace `<name>` with the module name (kebab-case) and `<Name>` with PascalCase.

### `<name>.routes.ts`

```typescript
import { Router, type IRouter } from "express";
// Import controllers and middleware as needed
// import { authMiddleware } from "../../shared/middlewares";
// import { validateBody, validateQuery, validateParams } from "../../shared/middlewares";

const router: IRouter = Router();

// Define routes here
// router.get("/", getAllController);
// router.get("/:id", getByIdController);
// router.post("/", authMiddleware, validateBody(createSchema), createController);

export default router;
```

### `<name>.controller.ts`

```typescript
import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";

export const getAllController = asyncHandler(async (req: Request, res: Response) => {
  // const result = await getAllService();
  // returnSuccess(res, result, "Retrieved successfully", StatusCode.SUCCESS);
});
```

### `<name>.service.ts`

```typescript
// Import from cache and repository

export const getAll = async () => {
  // 1. Check cache first
  // const cached = await myCache.get(cacheKey);
  // if (cached) return cached;

  // 2. Query database via repository
  // const result = await findAll();

  // 3. Write to cache (non-blocking)
  // myCache.set(cacheKey, result).catch(err => console.error("Cache write failed:", err));

  // return result;
};
```

### `<name>.repository.ts`

```typescript
import { db } from "../../config/postgres.config";
// import { eq, and, sql } from "drizzle-orm";
// import schema tables

export const findAll = async () => {
  // return await db.select().from(myTable).where(condition);
};
```

### `<name>.cache.ts` (if caching is needed)

```typescript
import { createCache } from "../../shared/services";

const CACHE_TTL = 300; // 5 minutes

export const myCache = createCache<MyType>("module-prefix", CACHE_TTL);

// Key builders
export const listKey = (page: number, limit: number) => `p${page}:l${limit}`;
```

### `types/index.ts`

```typescript
export interface MyResponse {
  // Define response shape
}
```

### `<name>.validations.ts` (if the module accepts input)

```typescript
import { z } from "zod";

export const createSchema = z.object({
  // Define fields
});

export type CreateDto = z.infer<typeof createSchema>;
```

### `index.ts`

```typescript
export { default as myRoutes } from "./<name>.routes";
```

3. Register routes in `apps/gratia-api/src/config/routes.config.ts`:
   - Add import at the top
   - Add `router.use("/<name>s", myRoutes);` inside `routesConfig`

4. If database table needed, create schema at `apps/gratia-api/src/db/schema/<name>.schema.ts` and export from `apps/gratia-api/src/db/schema/index.ts`.

## Conventions

- Controllers always use `asyncHandler()` wrapper
- Errors: `throw new AppError(message, ErrorCode, statusCode)` from `../../shared/errors/base.errors`
- Success responses: `returnSuccess(res, data, message, StatusCode.SUCCESS)`
- Cache writes are non-blocking with `.catch()`
- Validation: `validateBody(schema)`, `validateQuery(schema)`, `validateParams(schema)`
- Protected routes: `authMiddleware` or `optionalAuthMiddleware`
- Repository functions do pure database queries, no business logic
- Service functions handle caching + business logic

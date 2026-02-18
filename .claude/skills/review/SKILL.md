---
name: review
description: Review code changes for quality, security, and adherence to Gratia project conventions. Checks TypeScript types, caching patterns, error handling, API conventions, and frontend patterns.
allowed-tools: Read, Grep, Glob, Bash
---

# Code Review

Review current code changes against the Gratia project conventions and best practices.

## Process

1. Run `git diff` to see current changes (or review files passed as `$ARGUMENTS`)
2. Check each file against the checklist below
3. Report findings organized by severity:
   - **Critical** — Security issues, data loss risks, crashes
   - **Warning** — Pattern violations, potential bugs, performance issues
   - **Suggestion** — Style improvements, better patterns, cleanup
4. Include specific file paths and line references
5. Suggest concrete fixes for each issue

## Review Checklist

### Security
- [ ] No secrets, API keys, or credentials in source code
- [ ] Auth middleware (`authMiddleware` / `optionalAuthMiddleware`) on all protected routes
- [ ] Zod validation on all POST/PUT/PATCH request bodies
- [ ] No raw SQL strings — all queries through Drizzle ORM query builder
- [ ] Stripe webhook signature verification in place
- [ ] No user input passed directly into SQL template literals without parameterization

### TypeScript Quality
- [ ] No `any` type (only exception: Drizzle JSONB `Record<string, any>` for product attributes)
- [ ] Explicit return types on service and repository functions
- [ ] Zod schema types exported with `z.infer<typeof schema>`
- [ ] Proper use of `exactOptionalPropertyTypes` (explicit `| undefined`)

### API Patterns
- [ ] Controllers use `asyncHandler()` wrapper
- [ ] Errors thrown as `new AppError(message, ErrorCode, statusCode)`
- [ ] Success responses use `returnSuccess(res, data, message, statusCode)`
- [ ] Services handle caching, repositories handle pure DB queries
- [ ] Routes registered in `src/config/routes.config.ts`

### Caching
- [ ] Cache created with `createCache<T>(prefix, ttl)` pattern
- [ ] TTL values reasonable (not too long for frequently changing data)
- [ ] Cache invalidation on data mutations
- [ ] Cache writes non-blocking with `.catch()`
- [ ] Graceful degradation — no crash if Redis is unavailable

### Frontend Patterns
- [ ] `"use client"` directive only where hooks/event handlers/browser APIs are used
- [ ] Server actions use `"use server"` directive
- [ ] SCSS Modules for styling (not inline styles or CSS-in-JS)
- [ ] Forms use React Hook Form + Zod resolver
- [ ] Zustand for client state, TanStack Query for server state

### General
- [ ] Consistent naming: camelCase functions/variables, PascalCase types/components
- [ ] No `console.log` in production code (only in error handlers and connection logs)
- [ ] No hardcoded values that should be constants or environment variables
- [ ] Named exports for services/utils, default exports for routes/components

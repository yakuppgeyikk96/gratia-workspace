---
name: deploy-check
description: Run pre-deployment verification for the Gratia workspace. Checks types, lint, build, and tests sequentially.
disable-model-invocation: true
argument-hint: [api|ui|all]
allowed-tools: Bash, Read, Glob, Grep
---

# Pre-Deployment Check

Run all verification steps before deploying. Default target: `all`.

## Usage

- `/deploy-check` or `/deploy-check all` — Check everything
- `/deploy-check api` — Check API only
- `/deploy-check ui` — Check UI only

## Checklist (run in order, stop on first failure)

### 1. Type Check

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace && pnpm check-types
```

All TypeScript errors must be resolved.

### 2. Lint

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace && pnpm lint
```

All ESLint errors must be resolved. Note warnings but they are non-blocking.

### 3. Build

For API:
```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-api && pnpm build
```

For UI:
```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && pnpm build
```

For all:
```bash
cd /Users/yakupgeyik/Projects/gratia-workspace && pnpm build
```

### 4. Tests (UI only)

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && pnpm test
```

### 5. Environment Check

Verify required env vars are documented in `.env.example` files.

## Report Summary

After all checks, report:

```
Type Check:  PASS/FAIL
Lint:        PASS/FAIL (X warnings)
Build:       PASS/FAIL
Tests:       PASS/FAIL (X passed, Y failed)
─────────────────────────
Overall:     READY TO DEPLOY / NOT READY
```

If any step fails, provide the error details and suggest fixes.

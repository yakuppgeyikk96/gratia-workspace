---
name: test
description: Run tests intelligently for the Gratia workspace. Auto-detects which app changed and runs the relevant test suite.
disable-model-invocation: true
argument-hint: [api|ui|all|file-path]
allowed-tools: Bash, Read, Glob, Grep
---

# Run Tests

Run the appropriate test suite based on the argument or detected changes.

## Usage

- `/test` — Auto-detect changed files and run relevant tests
- `/test ui` — Run all UI tests (Vitest)
- `/test api` — Run API type checks (no test runner for API)
- `/test all` — Run all tests across workspace
- `/test <file-path>` — Run test for a specific file

## Process

### Auto-detect (no argument)

1. Run `git diff --name-only` to find changed files
2. If files in `apps/gratia-ui/` → run UI tests
3. If files in `apps/gratia-api/` → run API type check
4. If files in `packages/ui/` → run UI package type check
5. Run the relevant commands

### UI Tests

```bash
# All tests
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && pnpm test

# Specific file
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && npx vitest run <file-path>

# Watch mode
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && pnpm test:watch

# Coverage
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-ui && pnpm test:coverage
```

### API Type Check

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-api && pnpm check-types
```

### Full Workspace

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace && pnpm check-types && cd apps/gratia-ui && pnpm test
```

## Report Results

After running, report:
1. Total tests run, passed, failed
2. For failures: file name, test name, error message
3. Suggest fixes for any failing tests

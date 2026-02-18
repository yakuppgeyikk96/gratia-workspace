---
name: db-migrate
description: Run the Drizzle database migration workflow for the Gratia API. Generates, runs, or pushes migrations.
disable-model-invocation: true
argument-hint: [generate|migrate|push|studio]
allowed-tools: Bash, Read, Glob, Grep
---

# Database Migration Workflow

Run Drizzle database operations for the Gratia API.

## Usage

- `/db-migrate generate` — Generate migration files from schema changes
- `/db-migrate migrate` — Run pending migrations
- `/db-migrate push` — Push schema changes directly (dev only, no migration files)
- `/db-migrate studio` — Open Drizzle Studio GUI

## Steps

1. Run the requested command from `apps/gratia-api/`:

```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-api && pnpm db:$ARGUMENTS
```

2. If `generate` was run:
   - Check the generated SQL in `apps/gratia-api/drizzle/` directory
   - Review the migration for correctness (table names, column types, constraints)
   - Report what tables/columns were changed

3. If `migrate` was run:
   - Report success or failure
   - If it fails, show the error and suggest fixes

4. After any schema change, verify types compile:
```bash
cd /Users/yakupgeyik/Projects/gratia-workspace/apps/gratia-api && pnpm check-types
```

## Schema Location

- Schema files: `apps/gratia-api/src/db/schema/*.schema.ts`
- Barrel export: `apps/gratia-api/src/db/schema/index.ts`
- Drizzle config: `apps/gratia-api/drizzle.config.ts`
- Migration output: `apps/gratia-api/drizzle/`

## Schema Pattern

```typescript
import { pgTable, serial, varchar, integer, boolean, timestamp, decimal, text, jsonb } from "drizzle-orm/pg-core";

export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

## Important

- After creating a new schema file, **always export it** from `apps/gratia-api/src/db/schema/index.ts`
- Use `.$type<T>()` on JSONB columns for TypeScript type inference
- Foreign keys: use `.references(() => otherTable.id, { onDelete: "restrict" })` or `"cascade"` as appropriate
- Never use `db:push` in production — always use `db:generate` + `db:migrate`

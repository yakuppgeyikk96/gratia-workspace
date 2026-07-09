# Gratia — E-Commerce Platform

A full-stack e-commerce platform I build in my spare time to work through the problems a real
storefront actually has: stock integrity under concurrent checkout, idempotent payments, and
enough observability to know what the system is doing.

**Live demo:** [gratia-ui.vercel.app](https://gratia-ui.vercel.app)

|              |                                                   |
| ------------ | ------------------------------------------------- |
| Demo account | `demo@gratia.dev` / `DemoPass123!`                |
| Test card    | `4242 4242 4242 4242`, any future expiry, any CVC |

---

## What's interesting here

Most of the surface area is ordinary — products, cart, checkout, orders. These are the parts
that were not.

**Overselling under concurrency.** Two customers reserving the last unit at the same moment must
not both succeed. Stock reads happen inside a transaction with a row-level pessimistic lock
(`SELECT stock … FOR UPDATE`), so the second transaction blocks until the first commits.

**Duplicate orders.** A double-clicked "Pay" button, or a client retry on a slow response, must
not create two orders. Checkout completion takes an atomic claim in Redis (`SET key … NX EX`);
only the first concurrent request proceeds, and the rest wait for its result.

**Payment idempotency.** Outbound Stripe calls carry an idempotency key. Inbound Stripe webhooks
are de-duplicated by persisting every delivery to a `webhook_event` table with a unique constraint
on `event_id` — Stripe retries, and the second delivery becomes a no-op instead of a second order.

**Observability.** A small hand-written metrics registry: histograms, plus tracing wrappers around
the Postgres and Redis clients. Exposed at `/api/metrics`, gated behind `METRICS_TOKEN` outside
development.

**Search.** Product search runs on a Postgres `tsvector` column (migration
`0002_product_search_vector.sql`) rather than `ILIKE '%…%'`.

---

## Stack

| Layer              |                                                                      |
| ------------------ | -------------------------------------------------------------------- |
| **Monorepo**       | pnpm workspaces + Turborepo                                          |
| **Frontend**       | Next.js, TypeScript, Zustand, TanStack Query, SCSS modules, Radix UI |
| **Backend**        | Node.js, Express 5, TypeScript, Zod, Helmet                          |
| **Database**       | PostgreSQL via Drizzle ORM + drizzle-kit migrations                  |
| **Cache & locks**  | Redis                                                                |
| **Payments**       | Stripe (Checkout + webhooks)                                         |
| **Email**          | Resend                                                               |
| **Object storage** | Google Cloud Storage (`fake-gcs-server` locally)                     |
| **Deployment**     | API → Cloud Run (Cloud Build) · UI → Vercel                          |

---

## Structure

```
gratia-workspace/
├── apps/
│   ├── gratia-api/                # Express + Drizzle REST API
│   ├── gratia-ui/                 # Next.js storefront
│   └── gratia-vendor-dashboard/   # Next.js vendor console
└── packages/
    ├── ui/                        # Shared component library (Radix UI + SCSS)
    ├── eslint-config/
    └── typescript-config/
```

The API is organised by module — `auth`, `cart`, `checkout`, `order`, `product`, `vendor`,
`webhooks`, `metrics` and others — each with its own routes, controller, service and repository.

---

## Quick start

Requires Docker and pnpm.

```bash
cp .env.example .env
cp apps/gratia-api/.env.example apps/gratia-api/.env
pnpm install

pnpm docker:up                          # api, ui, vendor dashboard, postgres, redis, fake-gcs
```

Then, in a second shell:

```bash
pnpm --filter=gratia-api db:migrate     # apply migrations
pnpm --filter=gratia-api db:seed        # populate products, categories, brands
```

|                  |                       |
| ---------------- | --------------------- |
| Storefront       | http://localhost:3001 |
| Vendor dashboard | http://localhost:3100 |
| API              | http://localhost:8080 |

The local Postgres runs in Docker. From your host, reach it at `localhost:5432`; the API container
reaches the same database at `postgres:5432`, which `docker-compose.yml` sets for you. Production
runs on Supabase, and is only selected when `NODE_ENV=production` — so a local run can never write
to it by accident.

To exercise Stripe webhooks locally:

```bash
stripe listen --forward-to http://localhost:8080/api/webhooks/stripe
```

---

## Status

A learning project, actively developed. Known gaps I'm working on:

- **No automated tests on the API yet.** The locking and idempotency paths are the first target —
  they are the code that most needs them.
- **No CI pipeline** beyond the Cloud Build config for the API. Lint, types and build should run
  on every pull request.
- **No load tests.** The concurrency claims above are reasoned, not yet measured under load.
- **The checkout Redis claim is not well designed.** It holds a one-hour TTL, so a request that
  claims the lock and then crashes leaves that session unusable for an hour; and a waiting request
  sleeps a fixed two seconds before reading the result once. Both deserve a better approach.

import { AsyncLocalStorage } from "async_hooks";

export interface RequestMetrics {
  dbCalls: number;
  dbTotalMs: number;
  redisCalls: number;
  redisTotalMs: number;
}

const storage = new AsyncLocalStorage<RequestMetrics>();

export const runWithMetricsContext = <T>(
  fn: (ctx: RequestMetrics) => T
): T => {
  const ctx: RequestMetrics = {
    dbCalls: 0,
    dbTotalMs: 0,
    redisCalls: 0,
    redisTotalMs: 0,
  };
  return storage.run(ctx, () => fn(ctx));
};

export const getMetricsContext = (): RequestMetrics | undefined =>
  storage.getStore();

export const recordDbCall = (durationMs: number): void => {
  const ctx = storage.getStore();
  if (!ctx) return;
  ctx.dbCalls += 1;
  ctx.dbTotalMs += durationMs;
};

export const recordRedisCall = (durationMs: number): void => {
  const ctx = storage.getStore();
  if (!ctx) return;
  ctx.redisCalls += 1;
  ctx.redisTotalMs += durationMs;
};

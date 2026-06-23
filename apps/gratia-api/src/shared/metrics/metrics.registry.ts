import { PercentileSnapshot, Reservoir } from "./histogram";

export interface RouteStatsInput {
  routeKey: string;
  durationMs: number;
  statusCode: number;
  dbCalls: number;
  dbTotalMs: number;
  redisCalls: number;
  redisTotalMs: number;
}

interface RouteStats {
  count: number;
  errorCount: number;
  totalDurationMs: number;
  dbCalls: number;
  dbTotalMs: number;
  redisCalls: number;
  redisTotalMs: number;
  durations: Reservoir;
}

export interface RouteSnapshot {
  route: string;
  count: number;
  errorCount: number;
  duration: PercentileSnapshot & { avg: number };
  db: { avgCalls: number; avgMs: number; totalCalls: number; totalMs: number };
  redis: { avgCalls: number; avgMs: number; totalCalls: number; totalMs: number };
}

export interface MetricsSnapshot {
  uptimeMs: number;
  startedAt: string;
  routes: RouteSnapshot[];
  totals: {
    requests: number;
    errors: number;
    dbCalls: number;
    redisCalls: number;
  };
}

const startTime = Date.now();
const stats = new Map<string, RouteStats>();

const createStats = (): RouteStats => ({
  count: 0,
  errorCount: 0,
  totalDurationMs: 0,
  dbCalls: 0,
  dbTotalMs: 0,
  redisCalls: 0,
  redisTotalMs: 0,
  durations: new Reservoir(),
});

export const recordRequest = (input: RouteStatsInput): void => {
  let entry = stats.get(input.routeKey);
  if (!entry) {
    entry = createStats();
    stats.set(input.routeKey, entry);
  }
  entry.count += 1;
  if (input.statusCode >= 500) {
    entry.errorCount += 1;
  }
  entry.totalDurationMs += input.durationMs;
  entry.dbCalls += input.dbCalls;
  entry.dbTotalMs += input.dbTotalMs;
  entry.redisCalls += input.redisCalls;
  entry.redisTotalMs += input.redisTotalMs;
  entry.durations.add(input.durationMs);
};

export const resetMetrics = (): void => {
  stats.clear();
};

export const getMetricsSnapshot = (): MetricsSnapshot => {
  const routes: RouteSnapshot[] = [];
  let totalRequests = 0;
  let totalErrors = 0;
  let totalDbCalls = 0;
  let totalRedisCalls = 0;

  for (const [route, entry] of stats.entries()) {
    const percentiles = entry.durations.snapshot();
    const avg = entry.count > 0 ? round(entry.totalDurationMs / entry.count) : 0;
    routes.push({
      route,
      count: entry.count,
      errorCount: entry.errorCount,
      duration: { ...percentiles, avg },
      db: {
        avgCalls: round(entry.dbCalls / Math.max(1, entry.count)),
        avgMs: round(entry.dbTotalMs / Math.max(1, entry.count)),
        totalCalls: entry.dbCalls,
        totalMs: round(entry.dbTotalMs),
      },
      redis: {
        avgCalls: round(entry.redisCalls / Math.max(1, entry.count)),
        avgMs: round(entry.redisTotalMs / Math.max(1, entry.count)),
        totalCalls: entry.redisCalls,
        totalMs: round(entry.redisTotalMs),
      },
    });
    totalRequests += entry.count;
    totalErrors += entry.errorCount;
    totalDbCalls += entry.dbCalls;
    totalRedisCalls += entry.redisCalls;
  }

  routes.sort((a, b) => b.count - a.count);

  return {
    uptimeMs: Date.now() - startTime,
    startedAt: new Date(startTime).toISOString(),
    routes,
    totals: {
      requests: totalRequests,
      errors: totalErrors,
      dbCalls: totalDbCalls,
      redisCalls: totalRedisCalls,
    },
  };
};

const round = (n: number): number => Math.round(n * 100) / 100;

import { performance } from "perf_hooks";
import { recordDbCall } from "./metrics.context";

type AnyFn = (...args: unknown[]) => unknown;
type Thenable<T> = { then: (onFulfilled?: (v: T) => unknown, onRejected?: (e: unknown) => unknown) => unknown };

const isThenable = <T = unknown>(value: unknown): value is Thenable<T> =>
  typeof value === "object" && value !== null && typeof (value as { then?: unknown }).then === "function";

const instrumentQuery = <T>(query: T, startedAt: number): T => {
  if (!isThenable(query)) return query;
  const originalThen = query.then.bind(query);
  let recorded = false;
  const record = (): void => {
    if (recorded) return;
    recorded = true;
    recordDbCall(performance.now() - startedAt);
  };
  (query as Thenable<unknown>).then = (onFulfilled, onRejected) =>
    originalThen(
      (value) => {
        record();
        return onFulfilled ? onFulfilled(value) : value;
      },
      (error) => {
        record();
        if (onRejected) return onRejected(error);
        throw error;
      }
    );
  return query;
};

export const instrumentPostgresClient = <T extends object>(client: T): T => {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (prop === "unsafe" && typeof value === "function") {
        return function (this: unknown, ...args: unknown[]) {
          const startedAt = performance.now();
          const result = (value as AnyFn).apply(target, args);
          return instrumentQuery(result, startedAt);
        };
      }
      return value;
    },
    apply(target, thisArg, args) {
      const startedAt = performance.now();
      const result = Reflect.apply(target as unknown as AnyFn, thisArg, args);
      return instrumentQuery(result, startedAt);
    },
  });
};

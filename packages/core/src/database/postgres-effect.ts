export * as PostgresEffect from "./postgres-effect"

import { Effect } from "effect"

function promiseToEffect<T>(p: () => Promise<T>): Effect.Effect<T, Error> {
  return Effect.tryPromise({ try: p, catch: (e) => e instanceof Error ? e : new Error(String(e)) })
}

function wrapResult(query: any, isReturning: boolean = false): any {
  return new Proxy(query, {
    get(target, prop) {
      if (prop === "get") {
        if (isReturning) {
          return () => Effect.map(promiseToEffect(() => target.execute()), (r: any) => Array.isArray(r) ? (r[0] ?? undefined) : r)
        }
        return () => Effect.map(promiseToEffect(() => target.limit(1).execute()), (r: any) => r[0] ?? undefined)
      }
      if (prop === "all") {
        return () => Effect.map(promiseToEffect(() => target.execute()), (r: any) => Array.isArray(r) ? r : [r])
      }
      if (prop === "execute") {
        return () => promiseToEffect(() => target.execute())
      }
      if (prop === "run") {
        return () => Effect.map(promiseToEffect(() => target.execute()), () => undefined as any)
      }
      if (prop === "limit") {
        return (n: number) => wrapResult(target.limit(n), isReturning)
      }
      if (prop === "where") {
        return (...args: any[]) => wrapResult(target.where(...args), isReturning)
      }
      if (prop === "orderBy") {
        return (...args: any[]) => wrapResult(target.orderBy(...args), isReturning)
      }
      if (prop === "offset") {
        return (n: number) => wrapResult(target.offset(n), isReturning)
      }
      if (prop === "pipe") {
        return (...args: any[]) => wrapResult(target.pipe(...args), isReturning)
      }
      if (prop === "onConflictDoNothing") {
        return (...args: any[]) => wrapResult(target.onConflictDoNothing(...args), isReturning)
      }
      if (prop === "onConflictDoUpdate") {
        return (...args: any[]) => wrapResult(target.onConflictDoUpdate(...args), isReturning)
      }
      const val = Reflect.get(target, prop)
      if (typeof val === "function") {
        return (...args: any[]) => wrapResult(val.apply(target, args), isReturning)
      }
      return val
    },
  })
}

function wrapSelect(query: any): any {
  return new Proxy(query, {
    get(target, prop) {
      if (prop === "get") {
        return () => Effect.map(promiseToEffect(() => target.limit(1).execute()), (r: any) => r[0] ?? undefined)
      }
      if (prop === "all") {
        return () => Effect.map(promiseToEffect(() => target.execute()), (r: any) => Array.isArray(r) ? r : [r])
      }
      if (prop === "execute") {
        return () => promiseToEffect(() => target.execute())
      }
      if (prop === "run") {
        return () => Effect.map(promiseToEffect(() => target.execute()), () => undefined as any)
      }
      const val = Reflect.get(target, prop)
      if (typeof val === "function") {
        return (...args: any[]) => wrapSelect(val.apply(target, args))
      }
      return val
    },
  })
}

function wrapModify(query: any): any {
  return new Proxy(query, {
    get(target, prop) {
      if (prop === "run") {
        return () => Effect.map(promiseToEffect(() => target.execute()), () => undefined as any)
      }
      if (prop === "execute") {
        return () => promiseToEffect(() => target.execute())
      }
      if (prop === "returning") {
        return (...args: any[]) => wrapResult(target.returning(...args), true)
      }
      if (prop === "onConflictDoNothing") {
        return (...args: any[]) => wrapModify(target.onConflictDoNothing(...args))
      }
      if (prop === "onConflictDoUpdate") {
        return (...args: any[]) => wrapModify(target.onConflictDoUpdate(...args))
      }
      if (prop === "values") {
        return (...args: any[]) => wrapModify(target.values(...args))
      }
      if (prop === "set") {
        return (...args: any[]) => wrapModify(target.set(...args))
      }
      if (prop === "where") {
        return (...args: any[]) => wrapModify(target.where(...args))
      }
      if (prop === "from") {
        return (...args: any[]) => wrapModify(target.from(...args))
      }
      const val = Reflect.get(target, prop)
      if (typeof val === "function") {
        return (...args: any[]) => wrapModify(val.apply(target, args))
      }
      return val
    },
  })
}

export function wrapDb(pgDb: any): any {
  return new Proxy(pgDb, {
    get(target, prop) {
      if (prop === "select") {
        return (...args: any[]) => wrapSelect(target.select(...args))
      }
      if (prop === "selectDistinct") {
        return (...args: any[]) => wrapSelect(target.selectDistinct(...args))
      }
      if (prop === "insert") {
        return (...args: any[]) => wrapModify(target.insert(...args))
      }
      if (prop === "update") {
        return (...args: any[]) => wrapModify(target.update(...args))
      }
      if (prop === "delete") {
        return (...args: any[]) => wrapModify(target.delete(...args))
      }
      if (prop === "run") {
        return (sql: any) => Effect.map(promiseToEffect(() => target.execute(sql)), () => undefined as any)
      }
      if (prop === "all") {
        return (sql: any) => Effect.map(promiseToEffect(() => target.execute(sql)), (r: any) => Array.isArray(r) ? r : [r])
      }
      if (prop === "get") {
        return (sql: any) => Effect.map(promiseToEffect(() => target.execute(sql)), (r: any) => (Array.isArray(r) ? r[0] : r) ?? undefined)
      }
      if (prop === "transaction") {
        return (fn: (tx: any) => Effect.Effect<any, any, any>) => {
          return Effect.gen(function* () {
            const result = yield* promiseToEffect(() =>
              target.transaction((pgTx: any) => Effect.runPromise(fn(wrapDb(pgTx)) as any)),
            )
            return result
          })
        }
      }
      const val = Reflect.get(target, prop)
      return val
    },
  })
}
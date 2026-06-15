import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Reactivity from "effect/unstable/reactivity/Reactivity"
import { Postgres } from "./postgres"

interface Config {
  readonly url: string
  readonly max?: number
  readonly idle_timeout?: number
  readonly connect_timeout?: number
  readonly max_lifetime?: number
}

const nativeLayer = (config: Config) =>
  Layer.effect(
    Postgres.Native,
    Effect.gen(function* () {
      const sql = postgres(config.url, {
        max: config.max ?? 10,
        idle_timeout: config.idle_timeout ?? 20,
        connect_timeout: config.connect_timeout ?? 10,
        max_lifetime: config.max_lifetime ?? 60 * 60 * 24,
        debug: false,
      })
      yield* Effect.addFinalizer(() => Effect.promise(() => sql.end()))
      return {
        config,
        sql,
        end: Effect.promise(() => sql.end()),
      } satisfies Postgres.NativeInterface
    }),
  )

const drizzleLayer = Layer.effect(
  Postgres.Drizzle,
  Effect.gen(function* () {
    const { sql } = yield* Postgres.Native
    return drizzle({ client: sql })
  }),
)

export const layer = (config: Config) => {
  const native = nativeLayer(config)
  return Layer.merge(native, drizzleLayer).pipe(Layer.provide(native), Layer.provide(Reactivity.layer))
}
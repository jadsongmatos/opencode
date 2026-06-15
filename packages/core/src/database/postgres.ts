export * as Postgres from "./postgres"

import { Context, Effect } from "effect"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { Sql } from "postgres"

export interface NativeInterface {
  readonly config: {
    readonly url: string
    readonly max?: number
    readonly idle_timeout?: number
    readonly connect_timeout?: number
    readonly max_lifetime?: number
  }
  readonly sql: Sql
  readonly end: Effect.Effect<void>
}

export class Native extends Context.Service<Native, NativeInterface>()("@opencode-ai/core/database/PostgresNative") {}

export class Drizzle extends Context.Service<Drizzle, PostgresJsDatabase<any>>()("@opencode-ai/core/database/PostgresDrizzle") {}
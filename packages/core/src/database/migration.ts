export * as DatabaseMigration from "./migration"

import { sql } from "drizzle-orm"
import { Effect, Semaphore } from "effect"
import type { EffectDrizzleSqlite } from "@opencode-ai/effect-drizzle-sqlite"
import { migrations } from "./migration.gen"
import { isPostgres } from "./dialect"

type Database = EffectDrizzleSqlite.EffectSQLiteDatabase
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0]
const lock = Semaphore.makeUnsafe(1)

export type Migration = {
  id: string
  up: (tx: Transaction, dialect: "sqlite" | "postgres") => Effect.Effect<void, unknown>
}

const dialect = isPostgres() ? "postgres" : "sqlite"

export function apply(db: Database) {
  return lock.withPermit(applyOnly(db, migrations))
}

export function applyOnly(db: Database, input: Migration[]) {
  return Effect.gen(function* () {
    yield* db.run(
      sql`CREATE TABLE IF NOT EXISTS ${sql.identifier("migration")} (id TEXT PRIMARY KEY, time_completed INTEGER NOT NULL)`,
    )
    let completed = new Set(
      (yield* db.all<{ id: string }>(sql`SELECT id FROM ${sql.identifier("migration")}`)).map((row) => row.id),
    )
    if (completed.size === 0) {
      const drizzleMigrationsTable = yield* Effect.gen(function* () {
        const pgResult = yield* db.get(
          sql`SELECT table_name FROM information_schema.tables WHERE table_name = '__drizzle_migrations'`,
        ).pipe(Effect.catchCause(() => Effect.succeed(undefined)))
        if (pgResult) return pgResult
        return yield* db.get(
          sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${"__drizzle_migrations"}`,
        ).pipe(Effect.catchCause(() => Effect.succeed(undefined)))
      })
      if (drizzleMigrationsTable) {
        yield* db.run(sql`
          INSERT OR IGNORE INTO ${sql.identifier("migration")} (id, time_completed)
          SELECT name, ${Date.now()}
          FROM ${sql.identifier("__drizzle_migrations")}
          WHERE name IS NOT NULL
        `)
        completed = new Set(
          (yield* db.all<{ id: string }>(sql`SELECT id FROM ${sql.identifier("migration")}`)).map((row) => row.id),
        )
      }
    }

    for (const migration of input) {
      if (completed.has(migration.id)) continue
      yield* db.transaction((tx) =>
        Effect.gen(function* () {
          if (!process.env.OPENCODE_SKIP_MIGRATIONS) yield* migration.up(tx, dialect)
          yield* tx.run(
            sql`INSERT INTO ${sql.identifier("migration")} (id, time_completed) VALUES (${migration.id}, ${Date.now()})`,
          )
        }),
      )
    }
  })
}

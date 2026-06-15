export * as Database from "./database"

import { EffectDrizzleSqlite } from "@opencode-ai/effect-drizzle-sqlite"
import { layer as sqliteLayer } from "#sqlite"
import { layer as postgresLayer } from "#postgres"
import { Context, Effect, Layer } from "effect"
import { Global } from "../global"
import { Flag } from "../flag/flag"
import { isAbsolute, join } from "path"
import { DatabaseMigration } from "./migration"
import { InstallationChannel } from "../installation/version"
import { LayerNode } from "../effect/layer-node"
import { pgUrl, sqlitePath, isPostgres } from "./dialect"
import { Sqlite } from "./sqlite"
import { Postgres } from "./postgres"
import { PostgresEffect } from "./postgres-effect"

const makeSqliteDatabase = EffectDrizzleSqlite.makeWithDefaults()
type SqliteDatabaseShape = Effect.Success<typeof makeSqliteDatabase>

export interface Interface {
  db: SqliteDatabaseShape
}

export class Service extends Context.Service<Service, Interface>()("@opencode/v2/storage/Database") {}

function makeSqliteLayer() {
  return Effect.gen(function* () {
    const db = yield* makeSqliteDatabase

    yield* db.run("PRAGMA journal_mode = WAL")
    yield* db.run("PRAGMA synchronous = NORMAL")
    yield* db.run("PRAGMA busy_timeout = 5000")
    yield* db.run("PRAGMA cache_size = -64000")
    yield* db.run("PRAGMA foreign_keys = ON")
    yield* db.run("PRAGMA wal_checkpoint(PASSIVE)")
    yield* DatabaseMigration.apply(db)

    return { db }
  }).pipe(Effect.orDie)
}

function makePostgresLayer() {
  return Effect.gen(function* () {
    const rawDb = yield* Postgres.Drizzle
    const db = PostgresEffect.wrapDb(rawDb) as SqliteDatabaseShape
    return { db }
  }).pipe(Effect.orDie)
}

export const layer = Layer.effect(Service, makeSqliteLayer())

export function layerFromPath(filename: string) {
  return layer.pipe(Layer.provide(sqliteLayer({ filename })))
}

function layerFromUrl(url: string) {
  const pgLayer = Layer.effect(Service, makePostgresLayer())
  return pgLayer.pipe(Layer.provide(postgresLayer({ url })))
}

export function path() {
  if (Flag.OPENCODE_DB) {
    if (Flag.OPENCODE_DB === ":memory:" || isAbsolute(Flag.OPENCODE_DB)) return Flag.OPENCODE_DB
    return join(Global.Path.data, Flag.OPENCODE_DB)
  }
  if (
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.OPENCODE_DISABLE_CHANNEL_DB === "1" ||
    process.env.OPENCODE_DISABLE_CHANNEL_DB === "true"
  )
    return join(Global.Path.data, "opencode.db")
  return join(Global.Path.data, `opencode-${InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
}

export const defaultLayer = Layer.unwrap(
  Effect.gen(function* () {
    if (isPostgres()) {
      const url = pgUrl()
      if (!url) {
        return yield* Effect.fail(new Error("PostgreSQL URL not configured"))
      }
      return layerFromUrl(url)
    }
    return layerFromPath(path())
  }),
).pipe(Layer.provide(Global.defaultLayer))

export const node = LayerNode.make(layerFromPath(path()), [])
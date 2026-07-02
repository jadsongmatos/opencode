import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260611192811_lush_chimera",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`DROP INDEX IF EXISTS "credential_connector_active_idx";`)
      yield* tx.run(`DROP TABLE "credential";`)
      yield* tx.run(`
        CREATE TABLE "credential" (
          "id" text PRIMARY KEY,
          "connector_id" text NOT NULL,
          "method_id" text NOT NULL,
          "label" text NOT NULL,
          "value" text NOT NULL,
          "active" integer NOT NULL DEFAULT 0,
          "time_created" integer NOT NULL,
          "time_updated" integer NOT NULL
        );
      `)
      yield* tx.run(`CREATE UNIQUE INDEX "credential_connector_active_idx" ON "credential" ("connector_id") WHERE "active" = 1;`)
    })
  },
} satisfies DatabaseMigration.Migration
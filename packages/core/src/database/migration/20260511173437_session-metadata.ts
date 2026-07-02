import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260511173437_session-metadata",
  up(tx, dialect: "sqlite" | "postgres") {
    return Effect.gen(function* () {
      // This column briefly shipped again under 20260530232709_lovely_romulus.
      let hasMetadata = false
      if (dialect === "sqlite") {
        hasMetadata = (yield* tx.all<{ name: string }>("PRAGMA table_info(\"session\")")).some((column) => column.name === "metadata")
      } else {
        const cols = yield* tx.all<{ column_name: string }>(
          `SELECT column_name FROM information_schema.columns WHERE table_name = 'session' AND column_name = 'metadata'`
        )
        hasMetadata = cols.length > 0
      }
      if (hasMetadata) return
      yield* tx.run("ALTER TABLE \"session\" ADD \"metadata\" text;")
    })
  },
} satisfies DatabaseMigration.Migration

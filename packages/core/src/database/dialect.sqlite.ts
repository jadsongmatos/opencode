import { sqliteTable as table, text, integer, primaryKey, index, uniqueIndex, foreignKey, customType, real, json } from "drizzle-orm/sqlite-core"

const jsonb = (name?: string) => text(name, { mode: "json" })

export {
  table,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
  foreignKey,
  customType,
  real,
  jsonb,
}

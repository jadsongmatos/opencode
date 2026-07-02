DROP INDEX IF EXISTS "credential_connector_active_idx";--> statement-breakpoint
DROP TABLE "credential";--> statement-breakpoint
CREATE TABLE "credential" (
  "id" text PRIMARY KEY,
  "connector_id" text NOT NULL,
  "method_id" text NOT NULL,
  "label" text NOT NULL,
  "value" text NOT NULL,
  "active" integer NOT NULL DEFAULT 0,
  "time_created" integer NOT NULL,
  "time_updated" integer NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "credential_connector_active_idx" ON "credential" ("connector_id") WHERE "active" = 1;

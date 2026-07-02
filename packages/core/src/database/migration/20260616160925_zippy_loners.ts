import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260616160925_zippy_loners",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run("DROP INDEX IF EXISTS \"credential_connector_active_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"event_aggregate_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"event_aggregate_type_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"permission_project_action_resource_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"message_session_time_created_id_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"part_message_id_id_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"part_session_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_input_session_pending_delivery_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_input_session_admitted_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_input_session_promoted_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_message_session_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_message_session_type_seq_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_message_session_time_created_id_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_message_time_created_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_project_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_workspace_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"session_parent_idx\";")
      yield* tx.run("DROP INDEX IF EXISTS \"todo_session_idx\";")
      yield* tx.run("DROP TABLE \"workspace\";")
      yield* tx.run("DROP TABLE \"data_migration\";")
      yield* tx.run("DROP TABLE \"account_state\";")
      yield* tx.run("DROP TABLE \"account\";")
      yield* tx.run("DROP TABLE \"control_account\";")
      yield* tx.run("DROP TABLE \"credential\";")
      yield* tx.run("DROP TABLE \"event_sequence\";")
      yield* tx.run("DROP TABLE \"event\";")
      yield* tx.run("DROP TABLE \"permission\";")
      yield* tx.run("DROP TABLE \"project_directory\";")
      yield* tx.run("DROP TABLE \"project\";")
      yield* tx.run("DROP TABLE \"message\";")
      yield* tx.run("DROP TABLE \"part\";")
      yield* tx.run("DROP TABLE \"session_context_epoch\";")
      yield* tx.run("DROP TABLE \"session_input\";")
      yield* tx.run("DROP TABLE \"session_message\";")
      yield* tx.run("DROP TABLE \"session\";")
      yield* tx.run("DROP TABLE \"todo\";")
      yield* tx.run("DROP TABLE \"session_share\";")
    })
  },
} satisfies DatabaseMigration.Migration

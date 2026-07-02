CREATE TABLE \"session_entry\" (
          \"id\" text PRIMARY KEY,
          \"session_id\" text NOT NULL,
          \"type\" text NOT NULL,
          \"time_created\" integer NOT NULL,
          \"time_updated\" integer NOT NULL,
          \"data\" text NOT NULL,
          CONSTRAINT \"fk_session_entry_session_id_session_id_fk\" FOREIGN KEY (\"session_id\

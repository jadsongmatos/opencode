CREATE TABLE \"credential\" (
          \"id\" text PRIMARY KEY,
          \"connector_id\" text NOT NULL,
          \"method_id\" text NOT NULL,
          \"label\" text NOT NULL,
          \"value\" text NOT NULL,
          \"active\" integer DEFAULT false NOT NULL,
          \"time_created\" integer NOT NULL,
          \"time_updated\" integer NOT NULL
        );

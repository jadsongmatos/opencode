CREATE TABLE \"project_directory\" (
          \"project_id\" text NOT NULL,
          \"directory\" text NOT NULL,
          \"type\" text NOT NULL,
          \"time_created\" integer NOT NULL,
          CONSTRAINT \"project_directory_pk\" PRIMARY KEY(\"project_id\", \"directory\

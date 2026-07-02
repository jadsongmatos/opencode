CREATE TABLE \"project\" (
          \"id\" text PRIMARY KEY,
          \"worktree\" text NOT NULL,
          \"vcs\" text,
          \"name\" text,
          \"icon_url\" text,
          \"icon_color\" text,
          \"time_created\" integer NOT NULL,
          \"time_updated\" integer NOT NULL,
          \"time_initialized\" integer,
          \"sandboxes\" text NOT NULL
        );

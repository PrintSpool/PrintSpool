CREATE TABLE materials(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  props JSONB NOT NULL
);

CREATE INDEX materials_deleted ON materials((deleted_at IS NULL));

CREATE TABLE users(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  signalling_user_id TEXT,
  is_local_http_user BOOLEAN NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX users_deleted                   ON users((deleted_at IS NULL));
CREATE UNIQUE INDEX users_signalling_user_id ON users((deleted_at IS NULL), signalling_user_id);
CREATE INDEX users_is_local_http_user        ON users((deleted_at IS NULL), is_local_http_user);

CREATE TABLE invites(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  secret_hash TEXT NOT NULL,
  consumed BOOLEAN NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX invites_deleted            ON invites((deleted_at IS NULL));
CREATE UNIQUE INDEX invites_secret_hash ON invites((deleted_at IS NULL), secret_hash);
CREATE INDEX invites_consumed           ON invites((deleted_at IS NULL), consumed);

CREATE TABLE machine_signalling_updates(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  machine_id TEXT NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX machine_signalling_updates_deleted            ON machine_signalling_updates((deleted_at IS NULL));
CREATE UNIQUE INDEX machine_signalling_updates_machine_ids ON machine_signalling_updates((deleted_at IS NULL), machine_id);

CREATE TABLE machine_viewers(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  machine_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX machine_viewers_deleted             ON machine_viewers((deleted_at IS NULL));
CREATE UNIQUE INDEX machine_viewers_machine_user ON machine_viewers((deleted_at IS NULL), machine_id, user_id);
CREATE INDEX machine_viewers_machine             ON machine_viewers((deleted_at IS NULL), machine_id, expires_at);

CREATE TABLE tasks(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  machine_id TEXT NOT NULL,
  part_id TEXT,
  status TEXT NOT NULL,

  props JSONB NOT NULL

  -- version INT AS (JSON_EXTRACT(props, "$.version")) STORED,
  -- machine_id TEXT AS (JSON_EXTRACT(props, "$.machine_id")) STORED
);
CREATE INDEX tasks_deleted           ON tasks((deleted_at IS NULL));
CREATE INDEX tasks_status_part_id    ON tasks((deleted_at IS NULL), status, part_id);
CREATE INDEX tasks_status_machine_id ON tasks((deleted_at IS NULL), status, machine_id);

-- Print Queue
-- =======================================

CREATE TABLE print_queues(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  props JSONB NOT NULL
);

CREATE INDEX print_queues_deleted ON print_queues((deleted_at IS NULL));

CREATE TABLE machine_print_queues(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  machine_id TEXT NOT NULL,
  print_queue_id TEXT NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX machine_print_queues_deleted        ON machine_print_queues((deleted_at IS NULL));
CREATE UNIQUE INDEX machine_print_queues_ids     ON machine_print_queues((deleted_at IS NULL), machine_id, print_queue_id);
CREATE INDEX machine_print_queues_machine_id     ON machine_print_queues((deleted_at IS NULL), machine_id);
CREATE INDEX machine_print_queues_print_queue_id ON machine_print_queues((deleted_at IS NULL), print_queue_id);

CREATE TABLE packages(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  print_queue_id TEXT NOT NULL,
  quantity INT NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX packages_deleted        ON packages((deleted_at IS NULL));
CREATE INDEX packages_print_queue_id ON packages((deleted_at IS NULL), print_queue_id);

CREATE TABLE parts(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  package_id TEXT NOT NULL,
  quantity INT NOT NULL,
  position BIGINT NOT NULL,

  props JSONB NOT NULL
);

CREATE INDEX parts_deleted    ON parts((deleted_at IS NULL));
CREATE INDEX parts_package_id ON parts((deleted_at IS NULL), package_id);

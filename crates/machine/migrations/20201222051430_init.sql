CREATE TABLE materials(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE users(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  signalling_user_id TEXT,
  is_local_http_user BOOLEAN NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX users_signalling_user_id ON users(signalling_user_id);
CREATE INDEX users_is_local_http_user ON users(is_local_http_user);

CREATE TABLE invites(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  secret_hash TEXT NOT NULL,
  consumed BOOLEAN NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX invites_secret_hash ON invites(secret_hash);
CREATE INDEX invites_consumed ON invites(consumed);

CREATE TABLE machine_viewers(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  machine_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX machine_viewers_machine_user ON machine_viewers(machine_id, user_id);
CREATE INDEX machine_viewers_machine ON machine_viewers(machine_id, expires_at);

CREATE TABLE tasks(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  machine_id TEXT NOT NULL,
  part_id TEXT,
  status TEXT NOT NULL,

  props TEXT NOT NULL

  -- version INT AS (JSON_EXTRACT(props, "$.version")) STORED,
  -- machine_id TEXT AS (JSON_EXTRACT(props, "$.machine_id")) STORED
);
CREATE INDEX tasks_part_id ON tasks(status, part_id);
CREATE INDEX tasks_machine_id ON tasks(status, machine_id);

-- Print Queue
-- =======================================

CREATE TABLE print_queues(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  deleted_at TEXT,

  props TEXT NOT NULL
);

CREATE TABLE machine_print_queues(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  deleted_at TEXT,

  machine_id TEXT NOT NULL,
  print_queue_id TEXT NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX machine_print_queues_ids ON machine_print_queues(machine_id, print_queue_id, deleted_at);
CREATE INDEX machine_print_queues_machine_id ON machine_print_queues(machine_id);
CREATE INDEX machine_print_queues_print_queue_id ON machine_print_queues(print_queue_id);

CREATE TABLE packages(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  deleted_at TEXT,

  print_queue_id TEXT NOT NULL,
  quantity INT NOT NULL,

  props TEXT NOT NULL
);

CREATE TABLE parts(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  deleted_at TEXT,

  package_id TEXT NOT NULL,
  quantity INT NOT NULL,
  position BLOB NOT NULL,

  props TEXT NOT NULL
);

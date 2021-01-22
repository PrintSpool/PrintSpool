-- Add migration script here
CREATE TABLE materials(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE users(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE invites(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  public_key TEXT NOT NULL,
  slug TEXT NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX invites_pk ON invites(public_key);
CREATE UNIQUE INDEX invites_slug ON invites(slug);

CREATE TABLE machine_viewers(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  machine_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX machine_viewers_user ON machine_viewers(user_id);
CREATE UNIQUE INDEX machine_viewers_machine ON machine_viewers(machine_id, expires_at);

CREATE TABLE tasks(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  machine_id TEXT NOT NULL,

  props TEXT NOT NULL

  -- id TEXT PRIMARY KEY NOT NULL,
  -- props JSON NOT NULL
  -- version INT AS (JSON_EXTRACT(props, "$.version")) STORED,
  -- machine_id TEXT AS (JSON_EXTRACT(props, "$.machine_id")) STORED
);

-- Print Queue
-- =======================================

CREATE TABLE print_queues(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE packages(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  print_queue_id TEXT NOT NULL,

  -- quantity BLOB NOT NULL,

  props TEXT NOT NULL
);

CREATE TABLE parts(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  -- print_queue_id TEXT NOT NULL,
  package_id TEXT NOT NULL,

  -- quantity BLOB NOT NULL,
  -- position BLOB NOT NULL,

  props TEXT NOT NULL
);

CREATE TABLE prints(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  part_id TEXT NOT NULL,
  task_id TEXT NOT NULL,

  -- status TEXT NOT NULL,

  props TEXT NOT NULL
);

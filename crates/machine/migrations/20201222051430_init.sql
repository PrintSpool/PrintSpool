-- Add migration script here
CREATE TABLE materials(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE users(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  props TEXT NOT NULL
);

CREATE TABLE invites(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  public_key TEXT NOT NULL,
  slug TEXT NOT NULL,

  props TEXT NOT NULL
);

CREATE UNIQUE INDEX invites_pk ON invites(public_key);
CREATE UNIQUE INDEX invites_slug ON invites(slug);

CREATE TABLE tasks(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,

  machine_id INT NOT NULL,

  props TEXT NOT NULL

  -- id INT PRIMARY KEY NOT NULL,
  -- props JSON NOT NULL
  -- version INT AS (JSON_EXTRACT(props, "$.version")) STORED,
  -- machine_id INT AS (JSON_EXTRACT(props, "$.machine_id")) STORED
);

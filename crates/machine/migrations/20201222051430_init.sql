-- Add migration script here
CREATE TABLE materials(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL,

  name TEXT NOT NULL,
  props JSON NOT NULL
);

CREATE TABLE tasks(
  -- id INT PRIMARY KEY NOT NULL,
  -- version INT NOT NULL,

  -- machine_id INT NOT NULL,
  -- props JSON NOT NULL

  id INT PRIMARY KEY NOT NULL,
  props JSON NOT NULL,

  version INT AS (JSON_EXTRACT(props, "$.version")) STORED,
  machine_id INT AS (JSON_EXTRACT(props, "$.machine_id")) STORED
);

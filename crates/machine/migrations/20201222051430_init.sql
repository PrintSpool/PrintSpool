-- Add migration script here
CREATE TABLE materials(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL,

  name TEXT NOT NULL,
  props TEXT NOT NULL
);

CREATE TABLE tasks(
  id INT PRIMARY KEY NOT NULL,
  version INT NOT NULL,

  machine_id INT NOT NULL,
  props TEXT NOT NULL
);

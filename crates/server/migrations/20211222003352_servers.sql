-- Add migration script here

CREATE TABLE servers(
  id TEXT PRIMARY KEY NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,

  props JSONB NOT NULL
);

CREATE INDEX servers_is_self ON servers(
  ((servers.props->'is_self')::boolean)
);

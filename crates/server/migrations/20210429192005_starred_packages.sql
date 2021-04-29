ALTER TABLE packages
ADD COLUMN starred INT NOT NULL DEFAULT 0;

CREATE INDEX packages_starred_deleted        ON packages(deleted_at IS NULL, starred);
CREATE INDEX packages_starred_print_queue_id ON packages(deleted_at IS NULL, print_queue_id, starred);

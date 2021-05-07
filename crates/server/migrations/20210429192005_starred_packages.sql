ALTER TABLE packages
ADD COLUMN starred INT NOT NULL DEFAULT 0;

ALTER TABLE packages
ADD COLUMN based_on_package_id TEXT;

CREATE INDEX packages_starred_deleted        ON packages(deleted_at IS NULL, starred);
CREATE INDEX packages_starred_print_queue_id ON packages(deleted_at IS NULL, print_queue_id, starred);

ALTER TABLE parts
ADD COLUMN based_on_part_id TEXT;

ALTER TABLE parts
ADD COLUMN based_on_package_id TEXT;

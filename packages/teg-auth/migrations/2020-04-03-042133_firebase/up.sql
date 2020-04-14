-- Your SQL goes here
TRUNCATE users, invites RESTART IDENTITY;

ALTER TABLE users
DROP COLUMN user_profile_id;

ALTER TABLE users
ADD COLUMN firebase_uid TEXT NOT NULL;

ALTER TABLE users
DROP COLUMN name;

CREATE UNIQUE INDEX firebase_uid ON users (firebase_uid);

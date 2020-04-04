CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_authorized BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP with time zone NOT NULL,
    last_logged_in_at TIMESTAMP with time zone
);

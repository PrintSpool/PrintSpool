CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_profile_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_authorized BOOLEAN NOT NULL DEFAULT FALSE
);
